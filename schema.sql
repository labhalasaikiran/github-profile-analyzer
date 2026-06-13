CREATE DATABASE IF NOT EXISTS github_analyzer;

USE github_analyzer;

CREATE TABLE IF NOT EXISTS github_profiles (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(100) NOT NULL UNIQUE,
name VARCHAR(200),
bio TEXT,
location VARCHAR(200),
avatar_url VARCHAR(500),
profile_url VARCHAR(500),
public_repos INT DEFAULT 0,
followers INT DEFAULT 0,
following INT DEFAULT 0,
total_stars INT DEFAULT 0,
total_forks INT DEFAULT 0,
top_languages VARCHAR(500),
account_age_days INT DEFAULT 0,
github_joined_at DATETIME,
analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
