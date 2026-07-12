import manifest from '../constants/asset-manifest.json' with { type: 'json' };

export function resolveAsset(localPath) {
  if (!localPath) return '';
  const normalizedKey = localPath.startsWith('/') ? localPath.slice(1) : localPath;
  
  // Resolve from manifest if present, else fallback to local served asset
  return manifest[normalizedKey] || localPath;
}
