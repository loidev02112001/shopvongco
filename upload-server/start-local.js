import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(process.cwd(), '..');
const envPath = path.join(rootDir, '.env');

console.log('--- STARTING LOCAL BACKEND SERVERS ---');

// 1. Load .env file
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from: ${envPath}`);
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const firstEquals = trimmed.indexOf('=');
    if (firstEquals === -1) return;
    const key = trimmed.substring(0, firstEquals).trim();
    const val = trimmed.substring(firstEquals + 1).trim();
    
    // Set if not already set, or overwrite if needed
    process.env[key] = val;
  });
} else {
  console.warn(`No .env file found at ${envPath}. Using defaults.`);
}

// 2. Configure local upload directory
// Default to saving uploads in a local 'uploads' directory inside upload-server
const defaultUploadDir = path.join(process.cwd(), 'uploads');
if (!process.env.UPLOAD_DIR) {
  process.env.UPLOAD_DIR = defaultUploadDir;
}
console.log(`Uploads directory configured to: ${process.env.UPLOAD_DIR}`);

// Ensure the directory exists
if (!fs.existsSync(process.env.UPLOAD_DIR)) {
  fs.mkdirSync(process.env.UPLOAD_DIR, { recursive: true });
}

// 3. Start the services
console.log('Launching REST server on port 3000...');
import('./rest-server.js').catch(err => {
  console.error('Failed to start REST server:', err);
});

console.log('Launching Upload server on port 3001...');
import('./server.js').catch(err => {
  console.error('Failed to start Upload server:', err);
});
