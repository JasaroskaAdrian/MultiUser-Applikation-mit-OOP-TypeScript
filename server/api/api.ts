import { Request, Response, Express } from 'express'
import * as jwt from 'jsonwebtoken'
export class API {
  // Properties
  app: Express
  jwtSecret: string
  // Constructor
  constructor(app: Express, jwtSecret: string) {
    this.app = app
    this.jwtSecret = jwtSecret
    this.app.post('/api/login', this.login.bind(this))
  }
  // Methods
  private login(req: Request, res: Response) {
    res.send('Hello There!')
  }
}
