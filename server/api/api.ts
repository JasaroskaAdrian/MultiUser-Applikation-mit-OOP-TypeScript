import { Request, Response, Express, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Pool } from 'mariadb';

export class API {
  // Properties
  app: Express;
  jwtSecret: string;
  databasePool: Pool;

  // Constructor
  constructor(app: Express, jwtSecret: string, databasePool: Pool) {
    this.app = app;
    this.jwtSecret = jwtSecret;
    this.databasePool = databasePool;

    // Routes
    this.app.post('/api/login', this.login.bind(this));
    this.app.post('/api/register', this.register.bind(this));
    this.app.get('/api/protected', this.authenticateToken.bind(this), this.protectedRoute.bind(this));
  }

  // Methods
  private async login(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Benutzername und Passwort erforderlich' });
    }

    try {
      const conn = await this.databasePool.getConnection();
      const [user] = await conn.query('SELECT * FROM users WHERE name = ?', [username]);
      conn.release();

      if (!user) {
        return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
      }

      // Hier sollte ein gehashter Passwortvergleich stattfinden (z. B. bcrypt)
      const isPasswordValid = password === 'placeholder'; // Placeholder
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.name, roles: user.roles },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      res.status(200).json({ token, username: user.name });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Ein Fehler ist aufgetreten' });
    }
  }

  private async register(req: Request, res: Response) {
    const { username, password, roles } = req.body;

    if (!username || !password || !roles) {
      return res.status(400).json({ message: 'Benutzername, Passwort und Rolle erforderlich' });
    }

    try {
      const conn = await this.databasePool.getConnection();

      const [existingUser] = await conn.query('SELECT * FROM users WHERE name = ?', [username]);
      if (existingUser) {
        conn.release();
        return res.status(409).json({ message: 'Benutzername bereits vergeben' });
      }

      await conn.query('INSERT INTO users (name, roles) VALUES (?, ?)', [username, roles]);
      conn.release();

      res.status(201).json({ message: 'Benutzer erfolgreich registriert' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Ein Fehler ist aufgetreten' });
    }
  }

  private authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token erforderlich' });
    }

    jwt.verify(token, this.jwtSecret, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ message: 'Ungültiges Token' });
      }
      req.body.user = user; // Benutzerdaten in die Anfrage einfügen
      next();
    });
  }

  private protectedRoute(req: Request, res: Response) {
    res.status(200).json({ message: 'Geschützte Route erfolgreich erreicht', user: req.body.user });
  }
}
