import { Request, Response, Express } from 'express';
import { resolve } from 'path';

export class API {
  // Properties
  app: Express;

  // Constructor
  constructor(app: Express) {
    this.app = app;
    this.app.get('/login', this.serveLogin.bind(this)); // Binded this so i can ensure that its the correct context
  }

  // Methods
  private serveLogin(req: Request, res: Response) {
    const filePath = resolve('client', 'login.html');
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(500).send('Error serving the login.html file.');
      }
    });
  }
}
