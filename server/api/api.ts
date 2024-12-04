import { Request, Response, Express, NextFunction } from 'express';
import { ResultSetHeader } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authenticateToken from './auth/jwtAuth'; // Auth Middleware importieren
import { Database } from '../database/database';
import { AuthenticatedRequest } from './express'; // Pfad anpassen

export class API {
  app: Express;
  db: Database;

  constructor(app: Express, db: Database) {
    this.app = app;
    this.db = db;

    // Unprotected Routes
    this.app.post('/register', this.registerUser.bind(this));
    this.app.post('/login', this.loginUser.bind(this));

    
  }
  // --- Authentication ---
  private async registerUser(req: Request, res: Response) {
    const { username, password, email, firstName, lastName } = req.body;
  
    // Validierung der Eingabedaten
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).send('Invalid username or password');
    }
  
    if (!email || typeof email !== 'string') {
      return res.status(400).send('Invalid email');
    }
  
    try {
      // Passwort hashen
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // SQL-Query mit allen Feldern
      const query = `INSERT INTO users (username, password, email, firstName, lastName) VALUES (?, ?, ?, ?, ?)`;
      const values = [username, hashedPassword, email, firstName || null, lastName || null];
  
      // Daten in die Datenbank einfügen
      const result: ResultSetHeader = await this.db.executeSQL(query, values);
  
      // Erfolgsmeldung senden
      res.status(201).send('User registered successfully');
    } catch (error: any) {
      console.error('Error registering user:', error);
  
      // Fehlerbehandlung für doppelte Einträge (z. B. einzigartiger Benutzername)
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).send('Username or email already exists');
      }
  
      res.status(500).send('Error registering user');
    }
  }
  

  private async loginUser(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).send('Invalid username or password');
    }

    try {
      const query = `SELECT * FROM users WHERE username = ?`;
      const users: any = await this.db.executeSQL(query, [username]);

      if (users.length === 0) {
        return res.status(404).send('User not found');
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).send('Invalid credentials');
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'supersecretkey',
        { expiresIn: '1h' }
      );

      res.json({ token });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).send('Error logging in');
    }
  }
}