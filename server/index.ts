import express, { Express, Request, Response, NextFunction } from "express";
import { API } from "./api";
import http from "http";
import { resolve, dirname, join } from "path";
import { Database } from "./database";

class Backend {
  // Properties
  private _app: Express;
  private _api: API;
  private _database: Database;
  private _env: string;
  private _jwtSecret: string;

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
    this._env = process.env.NODE_ENV || "development";
    this._jwtSecret = process.env.JWT_SECRET || "default_secret"; // Example secret
    this._database = new Database();
    this._api = new API(this._app, this._jwtSecret); // Pass the secret to API

    this.setupMiddleware();
    this.setupStaticFiles();
    this.setupRoutes();
    this.startServer();
  }

  // Methods
  private setupMiddleware(): void {
    // Middleware for parsing JSON and handling errors
    this._app.use(express.json());
    this._app.use(this.globalErrorHandler);
  }

  private setupStaticFiles(): void {
    this._app.use(express.static("client"));
  }

  private setupRoutes(): void {
    const __dirname = resolve(dirname(""));

    // Serve main page
    this._app.get("/", (req: Request, res: Response) => {
      res.sendFile(join(__dirname, "client", "index.html"));
    });

    // Login page
    this._app.get("/login", (req: Request, res: Response) => {
      res.sendFile(join(__dirname, "client", "login.html"));
    });

    // Register page
    this._app.get("/register", (req: Request, res: Response) => {
      res.sendFile(join(__dirname, "client", "register.html"));
    });
  }

  private startServer(): void {
    if (this._env === "production") {
      http.createServer(this.app).listen(3000, () => {
        console.log("Server is listening!");
      });
    } else {
      console.log("Development server mode detected!");
    }
  }

  private globalErrorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    console.error("Global Error:", err.message);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
}

const backend = new Backend();
export const viteNodeApp = backend.app;
