import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import https from 'https';
import fs from 'fs';
import randomRouter from '@repo/su-done-ku-backend/src/routes/random';

const app: Express = express();
const PORT: number = 3000;
// const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;

// enable cors
app.use(cors());

// Middleware to serve static files
app.use(express.static('public'));

const rootDirectory = path.join(__dirname, '../../../..');

// Serve pathfinder-visualizer
app.use(
  '/pathfinder-visualizer',
  express.static(path.join(rootDirectory, 'apps/pathfinder-visualizer/dist')),
);

// Serve minesweeper
app.use(
  '/minesweeper',
  express.static(path.join(rootDirectory, 'apps/minesweeper/dist')),
);

// Serve enlight
app.use(
  '/enlight',
  express.static(path.join(rootDirectory, 'apps/enlight/dist')),
);

// Serve matrix-cam
app.use(
  '/ascii-video',
  express.static(path.join(rootDirectory, 'apps/ascii-video/dist')),
);

// Serve dread-ui
app.use(
  '/dread-ui',
  express.static(path.join(rootDirectory, 'packages/dread-ui/dist')),
);

// Serve homepage
app.use(
  '/home',
  express.static(path.join(rootDirectory, 'apps/home-page/dist')),
);

// Serve steering-text
app.use(
  '/steering-text',
  express.static(path.join(rootDirectory, 'apps/steering-text/dist')),
);

// Serve shareme
app.use(
  '/shareme',
  express.static(path.join(rootDirectory, 'apps/shareme/frontend/dist')),
);

app.use('/su-done-ku/api/random', randomRouter);

// Serve su-done-ku
app.use(
  '/su-done-ku',
  express.static(path.join(rootDirectory, 'apps/su-done-ku/frontend/dist')),
);

// Serve gifster
app.use(
  '/gifster',
  express.static(path.join(rootDirectory, 'apps/gifster/dist')),
);

// Serve sketches
app.use(
  '/sketches',
  express.static(path.join(rootDirectory, 'apps/sketches/dist')),
);

// Serve fallcrate
app.use(
  '/fallcrate',
  express.static(path.join(rootDirectory, 'apps/fallcrate/dist')),
);

// Serve portfolio
app.use(
  '/',
  express.static(path.join(rootDirectory, 'apps/portfolio/frontend/dist')),
);

app.use('*', (req: Request, res: Response) => {
  // Send a 404 page
  res.status(404).send('App not found');
});

// Check if HTTPS should be used
const certPath = path.join(rootDirectory, 'localhost+2.pem');
const keyPath = path.join(rootDirectory, 'localhost+2-key.pem');
const certsExist = fs.existsSync(certPath) && fs.existsSync(keyPath);

// Check if HTTPS is explicitly disabled via env var
const httpsDisabled = process.env.USE_HTTPS === 'false';
const useHttps = certsExist && !httpsDisabled;

if (httpsDisabled) {
  console.log('HTTPS disabled via USE_HTTPS=false');
} else if (!certsExist) {
  console.log('HTTPS certificates not found, using HTTP');
  console.log(`  Expected cert: ${certPath}`);
  console.log(`  Expected key: ${keyPath}`);
} else {
  console.log(`Found certificates at:`);
  console.log(`  Cert: ${certPath}`);
  console.log(`  Key: ${keyPath}`);
}

if (useHttps) {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
  
  https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at https://localhost:${PORT}`);
    console.log(`Network access: https://<your-ip>:${PORT}`);
    console.log('✓ HTTPS enabled with mkcert certificates');
  });
} else {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Network access: http://<your-ip>:${PORT}`);
    console.log('ℹ Running in HTTP mode');
  });
}
