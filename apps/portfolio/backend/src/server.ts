import express, { Express, Request, Response } from 'express';
import path from 'path';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;

// Middleware to serve static files
app.use(express.static('public'));

// Serve pathfinder-visualizer
app.use(
  '/pathfinder-visualizer',
  express.static(
    path.join(__dirname, '../../../../apps/pathfinder-visualizer/dist'),
  ),
);

// Serve minesweeper
app.use(
  '/minesweeper',
  express.static(path.join(__dirname, '../../../../apps/minesweeper/dist')),
);

// Serve enlight
app.use(
  '/enlight',
  express.static(path.join(__dirname, '../../../../apps/enlight/dist')),
);

// Serve matrix-cam
app.use(
  '/ascii-video',
  express.static(path.join(__dirname, '../../../../apps/ascii-video/dist')),
);

// Serve dread-ui
app.use(
  '/dread-ui',
  express.static(path.join(__dirname, '../../../../packages/dread-ui/dist')),
);

// Serve test-child
app.use(
  '/test-child',
  express.static(path.join(__dirname, '../../../../apps/test-child/dist')),
);

// Serve portfolio
app.use(
  '/',
  express.static(
    path.join(__dirname, '../../../../apps/portfolio/frontend/dist'),
  ),
);

app.use('*', (req: Request, res: Response) => {
  // Send a 404 page
  res.status(404).send('App not found');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
