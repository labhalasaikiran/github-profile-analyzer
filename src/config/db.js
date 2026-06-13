const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool (handles dropped connections automatically)
const db = mysql.createPool({
  host:                process.env.DB_HOST,
  port:                process.env.DB_PORT || 3306,
  user:                process.env.DB_USER,
  password:            process.env.DB_PASSWORD,
  database:            process.env.DB_NAME,
  waitForConnections:  true,
  connectionLimit:     10,
  queueLimit:          0
});

// Test connection and create table
db.getConnection((err, connection) => {
  if (err) {
    console.log('❌ Database connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL database');
  connection.release();
  createTable();
});

function createTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS github_profiles (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      username         VARCHAR(100) NOT NULL UNIQUE,
      name             VARCHAR(200),
      bio              TEXT,
      location         VARCHAR(200),
      avatar_url       VARCHAR(500),
      profile_url      VARCHAR(500),
      public_repos     INT DEFAULT 0,
      followers        INT DEFAULT 0,
      following        INT DEFAULT 0,
      total_stars      INT DEFAULT 0,
      total_forks      INT DEFAULT 0,
      top_languages    VARCHAR(500),
      account_age_days INT DEFAULT 0,
      github_joined_at VARCHAR(100),
      analyzed_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(query, (err) => {
    if (err) {
      console.log('❌ Error creating table:', err.message);
    } else {
      console.log('✅ Table is ready');
    }
  });
}

module.exports = db;