import { Request, Response, Express, request, NextFunction } from 'express';
import { Database } from '../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class API {
  // Properties
  app: Express;
  db: Database;

  // Constructor
  constructor(app: Express, db: Database) {
    this.app = app;
    this.db = db;
    this.routes();
  }

  // Methods
  private testAPI(req: Request, res: Response) {
    res.send('My API is successfully working');
  }

  private routes() {
    this.app.get('/', this.verifyToken)
    this.app.post('/register', this.register);
    this.app.post('/login', this.login);
    this.app.get('/testing', this.testAPI);
  }

  // Generate JWT Token
  private generatedJwtToken(username: string): Promise<any> | Response {
    const secret = process.env.JWT_SECRET || 'supersecret_jwt123';
    return jwt.sign({ username }, secret, { expiresIn: '7d' });
  }

  private async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers.authorization?.split(' ')[1]; // Extracts token from 'Bearer <token>'
  
    if (!token) {
      res.status(401).json({ message: 'Access Denied. No token provided.' });
      return;
    }
  
    try {
      const secret = process.env.JWT_SECRET || 'supersecret_jwt123';
      jwt.verify(token, secret);
      next(); // Passes control to the next middleware 
    } catch (err) {
      res.status(403).json({ message: 'Invalid or expired token.' });
      return;
    }
  }
  
  // Register method
  private register = async (req: Request, res: Response): Promise<any> => {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({ message: 'Please fill in all necessary information' });
    }

    const verifyUserinputValid = `SELECT * FROM \`users\` WHERE \`username\` = ?`;

    try {
      const checkIfUserExists = await this.db.executeSQL(verifyUserinputValid, username);

      if (checkIfUserExists.length > 0) {
        return res.status(409).json({ message: 'Username is taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUserQuery = `
        INSERT INTO \`users\` (\`username\`, \`password\`, \`email\`, \`firstName\`, \`lastName\`, \`role\`) 
        VALUES (?, ?, ?, ?, ?, 'user');
      `;

      await this.db.executeSQL(insertUserQuery, [username, hashedPassword, email, firstName, lastName]);
      res.status(200).json({ message: 'User successfully registered' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'An error occurred during registration' });
    }
  };

  // Login method
  private login = async (req: Request, res: Response): Promise<any> => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
      const userQuery = `SELECT * FROM \`users\` WHERE \`username\` = ?`;
      const users = await this.db.executeSQL(userQuery, [username]);

      if (!users || users.length === 0) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Generates JWT token
      const token = await this.generatedJwtToken(user.username);
      res.status(200).json({ message: 'Logged in successfully', token }); // Sends token in the response
      console.log('User found:', user);
      console.log('Generated token:', token);

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'An error occurred during login' });
    }
  };
}
