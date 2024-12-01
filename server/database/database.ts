import mariadb from 'mariadb';
import { Pool } from 'mariadb';
import { USER_TABLE, TWEET_TABLE, STARTING_USER } from './schema';

export class Database {
  private _pool: Pool;

  constructor() {
    this._pool = mariadb.createPool({
      database: process.env.DB_NAME || 'minitwitter',
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'minitwitter',
      password: process.env.DB_PASSWORD || 'supersecret123',
      connectionLimit: 5,
    });
    this.initializeDBSchema();
  }

  // Getter for the pool
  public get pool(): Pool {
    return this._pool;
  }

  private initializeDBSchema = async () => {
    console.log('Initializing DB schema...');
    await this.executeSQL(USER_TABLE);
    await this.executeSQL(TWEET_TABLE);

    const startingUserQuery = await STARTING_USER();
    await this.executeSQL(startingUserQuery);
  };

  // Modified executeSQL to accept parameters for queries
  public executeSQL = async (query: string, params: any[] = []) => {
    try {
      const conn = await this._pool.getConnection();
      const res = await conn.query(query, params); // Use params for parameterized queries
      conn.release();
      return res;
    } catch (err) {
      console.log(err);
      throw err; // Rethrow the error for proper handling in calling methods
    }
  };
}