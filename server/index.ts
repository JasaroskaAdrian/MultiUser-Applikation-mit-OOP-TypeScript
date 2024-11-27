import express, { Express, Request, Response, NextFunction } from 'express';
import { API } from './api';
import http from 'http';
import { resolve, dirname, join } from 'path';
import { Database } from './database';

class Backend {
  private _app: Express;
  private _api: API;
  private _database: Database;
  private _env: string;
  private _jwtSecret: string;

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
    this._jwtSecret = process.env.JWT_SECRET || 'default_secret';
    this._database = new Database();
    this._api = new API(this._app, this._jwtSecret, this._database.pool);

    this.setupMiddleware();
    this.setupStaticFiles();
    this.setupRoutes();
    this.startServer();
  }

  private setupMiddleware(): void {
    this._app.use(express.json());
    this._app.use(this.globalErrorHandler);
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
      console.log('Server läuft auf http://localhost:3000');
    });
  }

  private globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Globaler Fehler:', err.message);
    res.status(500).json({ error: 'Ein unerwarteter Fehler ist aufgetreten.' });
  }
}

const backend = new Backend();
export const viteNodeApp = backend.app;
