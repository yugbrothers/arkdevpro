import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  ListObjectsV2Command, 
  HeadObjectCommand 
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const BUCKET = process.env.B2_BUCKET || 'arkdev-pro-storage';
const ENDPOINT = process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com';

const s3 = new S3Client({
  endpoint: ENDPOINT,
  region: process.env.B2_REGION || 'us-east-005',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

export const b2Service = {
  async verifyConnection() {
    try {
      await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 1 }));
      return true;
    } catch (err) {
      console.error('❌ B2 connection failed:', err.message);
      return false;
    }
  },

  async uploadFile(localPath, key, md5Hash, retryCount = 3) {
    for (let i = 0; i < retryCount; i++) {
      try {
        const fileStream = fs.createReadStream(localPath);
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: fileStream,
          Metadata: { md5: md5Hash }
        }));
        return true;
      } catch (err) {
        if (i === retryCount - 1) throw err;
        console.warn(`⚠️ Retry ${i + 1}/${retryCount} for ${key}...`);
      }
    }
  },

  async downloadFile(key, localDestPath) {
    try {
      const dir = path.dirname(localDestPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const { Body } = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
      const writeStream = fs.createWriteStream(localDestPath);
      await new Promise((resolve, reject) => {
        Body.pipe(writeStream);
        Body.on('end', resolve);
        Body.on('error', reject);
      });
      return true;
    } catch (err) {
      console.error(`❌ Failed to download ${key}:`, err.message);
      return false;
    }
  },

  async getMetadata(key) {
    try {
      return await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    } catch {
      return null;
    }
  }
};
