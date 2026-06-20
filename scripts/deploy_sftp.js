/**
 * Million Mint AI Terminal — GoDaddy SFTP Deployment Script
 * 
 * This script uploads the statically exported frontend files (from `frontend/out`)
 * to your GoDaddy Hosting account via SFTP (SSH File Transfer Protocol).
 * 
 * Prerequisites:
 * 1. Configure Next.js for static exports by adding `output: 'export'` to `next.config.ts`.
 * 2. Build the project: `cd frontend && npm run build` (produces `frontend/out` folder).
 * 3. Install the required SFTP package: `npm install ssh2-sftp-client`
 * 4. Create a `.env.deploy` file in this directory with your GoDaddy credentials (see template below).
 */

const SftpClient = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env.deploy') });

// Credentials Configuration
const config = {
  host: process.env.SFTP_HOST || 'your-godaddy-ip-or-domain',
  port: parseInt(process.env.SFTP_PORT || '22', 10),
  username: process.env.SFTP_USERNAME || 'your-godaddy-username',
  password: process.env.SFTP_PASSWORD || 'your-godaddy-password',
  // Alternatively, point to your private key file:
  // privateKey: fs.readFileSync('path/to/id_rsa')
};

const localDir = path.join(__dirname, '../frontend/out');
const remoteDir = process.env.SFTP_REMOTE_DIR || '/public_html';

async function deploy() {
  const client = new SftpClient();

  if (!fs.existsSync(localDir)) {
    console.error(`Error: Local export directory "${localDir}" not found.`);
    console.error('Please run "cd frontend && npm run build" first to generate the static build files.');
    process.exit(1);
  }

  try {
    console.log(`Connecting to GoDaddy SFTP server: ${config.host}...`);
    await client.connect(config);
    console.log('Connected successfully.');

    console.log(`Uploading files from "${localDir}" to remote directory "${remoteDir}"...`);
    
    // Ensure remote directory exists
    const exists = await client.exists(remoteDir);
    if (!exists) {
      console.log(`Remote directory ${remoteDir} does not exist, creating it...`);
      await client.mkdir(remoteDir, true);
    }

    // Upload folder recursively
    client.on('upload', (info) => {
      console.log(`Uploaded: ${info.source} -> ${info.dest}`);
    });

    await client.uploadDir(localDir, remoteDir);
    console.log('Deployment completed successfully!');

  } catch (err) {
    console.error('Deployment failed:', err.message);
  } finally {
    await client.end();
  }
}

// Generate a template .env.deploy if it doesn't exist
const envDeployPath = path.join(__dirname, '../.env.deploy');
if (!fs.existsSync(envDeployPath)) {
  fs.writeFileSync(envDeployPath, 
`# GoDaddy SFTP Deployment Credentials
SFTP_HOST=
SFTP_PORT=22
SFTP_USERNAME=
SFTP_PASSWORD=
SFTP_REMOTE_DIR=/public_html
`
  );
  console.log(`Generated template credentials file at: ${envDeployPath}`);
  console.log('Please fill in your GoDaddy SFTP credentials in that file, then run:');
  console.log('  npm install ssh2-sftp-client dotenv');
  console.log('  node scripts/deploy_sftp.js');
} else {
  deploy();
}
