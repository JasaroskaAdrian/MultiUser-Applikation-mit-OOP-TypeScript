import express, { Express, Request, Response } from 'express';
import { API } from './api';
import http from 'http';
import { resolve, dirname } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';
import { Database } from './database';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config(); 


// Equivalent to __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url); // Get the file URL and convert it to the file path
const __dirname = path.dirname(__filename); // Get the directory name from the file path

class Backend {
  // Properties
  private _app: Express;
  private _api: API;
  private _database: Database;
  private _env: string;

  // Getters
  public get app(): Express {
    return this._app;
  }

  public get api(): API {
    return this._api;
  }

  public get database(): Database {
    return this._database;
  }

  // Constructor
  constructor() {
    this._app = express();
    this._database = new Database();

    this._app.use(bodyParser.json()); // For JSON parsing
    this._app.use(bodyParser.urlencoded({ extended: true })); // For URL-encoded parsing
    this.app.use(cors({
      origin: 'http://localhost:4200', // Adjust for your frontend URL
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Authorization', 'Content-Type']
    }));
    
    this._api = new API(this._app, this._database);
    this._env = process.env.NODE_ENV || 'development';

    this.setupStaticFiles();
    this.setupRoutes();
    this.startServer();
  }

  // Methods
  private setupStaticFiles(): void {
    // Correct path to the 'client' folder
    const staticPath = path.join(__dirname, '..', 'client'); // Going up one level to access the 'client' folder
    console.log(`Serving static files from: ${staticPath}`); // Debugging
  
    this._app.use(express.static(staticPath)); // Serve static files
  }
  

  private setupRoutes(): void {
    // Routes for login, register, and dashboard
    this._app.get('/login', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '..', 'client', 'login.html')); // Correct path to login.html
    });
    
    this._app.get('/register', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '..', 'client', 'register.html')); // Correct path to register.html
    });
    
    this._app.get('/dashboard', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '..', 'client', 'index.html')); // Correct path to index.html
    });
    
  }

  private startServer(): void {
    if (this._env === 'production') {
      http.createServer(this.app).listen(3000, () => {
        console.log('Server is listening!');
      });
    }
  }
}

const backend = new Backend();
export const viteNodeApp = backend.app;
