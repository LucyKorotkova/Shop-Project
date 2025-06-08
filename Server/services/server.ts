import express, { Express } from "express";

const host = process.env.LOCAL_HOST || "localhost";
const port = Number(process.env.LOCAL_PORT) || 4000;

export function initServer(): Express {
  const app = express();
  app.use(express.json());
  app.listen(port, host, () => {
    console.log(`Server running on port ${port}`);
  });
  return app;
}