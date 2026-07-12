import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { b2Service } from '../src/services/b2Service.js';

dotenv.config();

const ASSETS_DIR = path.resolve('./public/assets');
const MANIFEST_PATH = path.resolve('./src/constants/asset-manifest.json');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, files);
    } else {
      files.push(filePath);
    }
  }
  return files;
}

function calculateMD5(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(data).digest('hex');
}

async function runCommand() {
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';

  const connected = await b2Service.verifyConnection();
  if (!connected) {
    console.error('❌ Could not connect to Backblaze B2. Check your credentials in .env.');
    process.exit(1);
  }

  if (command === 'init' || command === 'upload' || command === 'sync') {
    console.log('🔄 Scanning local assets under public/assets...');
    const localFiles = getFiles(ASSETS_DIR);
    let manifest = {};
    if (fs.existsSync(MANIFEST_PATH)) {
      try {
        manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
      } catch {
        manifest = {};
      }
    }

    for (const file of localFiles) {
      const relativePath = path.relative(path.resolve('./public'), file);
      const key = relativePath.replace(/\\/g, '/'); // Normalize S3 path keys
      const md5 = calculateMD5(file);

      // Check if remote already has it
      const meta = await b2Service.getMetadata(key);
      const remoteMD5 = meta?.Metadata?.md5;

      if (remoteMD5 === md5) {
        console.log(`✅ ${key} is up to date on B2.`);
      } else {
        console.log(`📤 Uploading ${key}...`);
        await b2Service.uploadFile(file, key, md5);
        console.log(`✨ Uploaded ${key} successfully.`);
      }

      manifest[key] = `${process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com'}/${process.env.B2_BUCKET || 'arkdev-pro-storage'}/${key}`;

      // Configurable delete of local files after upload (non-development asset cleanup)
      if (process.env.REMOVE_LOCAL_ASSETS === 'true') {
        fs.unlinkSync(file);
        console.log(`🗑️ Removed local copy of ${key}`);
      }
    }

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`📝 Manifest updated at ${MANIFEST_PATH}`);
  }

  if (command === 'download' || command === 'sync') {
    console.log('📥 Verifying remote manifest...');
    if (fs.existsSync(MANIFEST_PATH)) {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
      for (const [key, b2Url] of Object.entries(manifest)) {
        const localDest = path.join(path.resolve('./public'), key);
        if (!fs.existsSync(localDest)) {
          console.log(`📥 Downloading missing local asset: ${key}...`);
          await b2Service.downloadFile(key, localDest);
        }
      }
    }
  }

  if (command === 'verify') {
    console.log('🔍 Verifying asset integrity...');
    const localFiles = getFiles(ASSETS_DIR);
    let allMatches = true;

    for (const file of localFiles) {
      const relativePath = path.relative(path.resolve('./public'), file);
      const key = relativePath.replace(/\\/g, '/');
      const md5 = calculateMD5(file);

      const meta = await b2Service.getMetadata(key);
      const remoteMD5 = meta?.Metadata?.md5;

      if (remoteMD5 !== md5) {
        console.error(`❌ Mismatch detected for ${key}! Local MD5: ${md5}, Remote MD5: ${remoteMD5}`);
        allMatches = false;
      }
    }

    if (allMatches) {
      console.log('✅ All local assets match the remote B2 bucket files.');
    } else {
      process.exit(1);
    }
  }
}

runCommand().catch(err => {
  console.error('❌ Synchronizer error:', err);
  process.exit(1);
});
