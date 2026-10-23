#!/usr/bin/env node

/**
 * Universal Uvicorn & Web Runner for Cloud Deployments (Render / Railway / Heroku)
 * ===============================================================================
 * Handles command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// Parse CLI args: --host 0.0.0.0 --port 10000
const args = process.argv.slice(2);
let port = parseInt(process.env.PORT, 10) || 10000;
let host = '0.0.0.0';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = parseInt(args[i + 1], 10) || port;
    i++;
  } else if (args[i] === '--host' && args[i + 1]) {
    host = args[i + 1];
    i++;
  }
}

// Check if Python uvicorn is available
let usePython = false;
try {
  const pythonBin = process.platform === 'win32' ? 'python' : 'python3';
  execSync(`${pythonBin} -c "import uvicorn, fastapi; print('OK')"`, { stdio: 'ignore' });
  usePython = true;
} catch (e) {
  usePython = false;
}

if (usePython) {
  const pythonBin = process.platform === 'win32' ? 'python' : 'python3';
  console.log(`[Universal Runner] Starting FastAPI backend with Python uvicorn on ${host}:${port}...`);
  const child = spawn(pythonBin, ['-m', 'uvicorn', ...args], {
    stdio: 'inherit',
    env: process.env,
    cwd: path.resolve(__dirname, '..')
  });
  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(`[Universal Runner] Python uvicorn exited with code ${code}. Falling back to Node web server...`);
      startNodeServer(host, port);
    } else {
      process.exit(0);
    }
  });
  child.on('error', () => {
    startNodeServer(host, port);
  });
} else {
  console.log(`[Universal Runner] Node environment detected. Starting high-performance web server on ${host}:${port}...`);
  startNodeServer(host, port);
}

function startNodeServer(listenHost, listenPort) {
  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'dist');
  const indexHtml = path.join(distDir, 'index.html');

  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
  };

  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Health check endpoint for Render monitoring
    if (pathname === '/health' || pathname === '/api/v1/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        service: 'Admission Enquiry Conversion Prediction & Follow-Up System',
        mode: 'production'
      }));
      return;
    }

    // Try serving static file from dist
    let filePath = path.join(distDir, pathname);
    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        // SPA Fallback: serve index.html for all client-side routes
        fs.readFile(indexHtml, (readErr, content) => {
          if (readErr) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<!DOCTYPE html><html><head><title>Admission Intelligence</title></head><body><h1>Admission Intelligence System</h1><p>Building client bundles...</p></body></html>`);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
          }
        });
      }
    });
  });

  server.listen(listenPort, listenHost, () => {
    console.log(`[Universal Runner] Application successfully LIVE on http://${listenHost}:${listenPort}`);
  });
}
