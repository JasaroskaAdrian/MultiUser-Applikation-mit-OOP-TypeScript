import { Request, Response, Express } from 'express';
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
    this.app.get('/hello', this.sayHello);
    this.app.post('/register', this.register);
    this.app.post('/login', this.login);
    this.db = db;
  }

  // Methods
  private sayHello(req: Request, res: Response) {
    res.send('Hello There!');
  }

  private register = async (req: Request, res: Response): Promise<any> => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL query using placeholders (?) for parameters
    const insertUserQuery = `
      INSERT INTO \`users\`(\`username\`, \`password\`, \`role_id\`) 
      VALUES (?, ?, (SELECT \`id\` FROM \`roles\` WHERE \`name\` = ?));
    `;

    try {
      // Execute SQL query with parameters (username, hashedPassword, role)
      await this.db.executeSQL(insertUserQuery, [username, hashedPassword, role]);
      res.sendStatus(200);
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'An error occurred during registration' });
    }
  };

  private login = async (req: Request, res: Response): Promise<any> => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
      // Secure SQL query with parameterized inputs
      const userQuery = `
        SELECT * FROM \`users\` WHERE \`username\` = ?
      `;
      const users = await this.db.executeSQL(userQuery, [username]);  // Use parameters to avoid SQL injection

      if (!users || users.length === 0) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const user = users[0];

      // Compare the password with the hashed one
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Ensure that the JWT secret is available, for example, from environment variables
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'; // Ensure you set this in .env file

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, roles: user.role_id },
        jwtSecret,  // Use the actual secret
        { expiresIn: '1h' }
      );

      res.status(200).json({ token, username: user.username });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'An error occurred during login' });
    }
  };
}
