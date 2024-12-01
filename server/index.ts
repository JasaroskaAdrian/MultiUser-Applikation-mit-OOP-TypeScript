import express, { Express, Request, Response, NextFunction } from 'express';
import { API } from './api';
import { resolve, dirname, join } from 'path';
import http from 'http';
import { Database } from './database';
import cors from 'cors';




class Backend {
  private _app: Express;
  private _api: API;
  private _database: Database;
  private _env: string;

  public get app(): Express {
    return this._app;
  }

  public get api(): API {
    return this._api;
  }

  public get database(): Database {
    return this._database;
  }

  constructor() {
    this._app = express();
    this._env = process.env.NODE_ENV || 'development';
    this._database = new Database();
    this._api = new API(this._app, this._database);

    this.setupMiddleware();
    this.setupStaticFiles();
    this.setupRoutes();
    this.startServer();
  }

  private setupMiddleware(): void {
    this._app.use(express.json()); // Make sure this is here to parse JSON request bodies and should in front of all middlewares that could use req, res!!! -> Info from Michel
    this._app.use(this.globalErrorHandler);  // Global error handling middleware
    this._app.use(cors());
  }

  private setupStaticFiles(): void {
    this._app.use(express.static('client')); 
  }

  private setupRoutes(): void {
    const __dirname = resolve(dirname(''));

    this._app.get('/', (req: Request, res: Response) => {
      res.sendFile(join(__dirname, 'client', 'index.html'));
    });

    this._app.get('/login', (req: Request, res: Response) => {
      res.sendFile(join(__dirname, 'client', 'login.html'));
    });

    this._app.get('/register', (req: Request, res: Response) => {
      res.sendFile(join(__dirname, 'client', 'register.html'));
    });
  }

  private startServer(): void {
    http.createServer(this.app).listen(3000, () => {
      console.log('Server is running at http://localhost:3000');
    });
  }

  private globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Global error:', err.message);
    res.status(500).json({ error: err.message || 'An unexpected error occurred.' });
  }
}

const backend = new Backend();
export const viteNodeApp = backend.app;
