import bcrypt from 'bcrypt';

const USER_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (username)
);
`;

const TWEET_TABLE = `
CREATE TABLE IF NOT EXISTS tweets (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    content VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

const STARTING_USER = async () => {
  const plainPassword = 'supersecret123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash das Passwort mit bcrypt

  return `
    INSERT INTO users (username, password, firstName, lastName, role)
    VALUES ('adi', '${hashedPassword}', 'Adrian', 'Jasaroska', 'admin')
    ON DUPLICATE KEY UPDATE username = username;
  `;
};

export { USER_TABLE, TWEET_TABLE, STARTING_USER };