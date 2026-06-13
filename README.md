# GitHub Profile Analyzer API

This project is a simple backend application built using Node.js, Express.js, and MySQL. It fetches public GitHub profile information using the GitHub API and stores useful insights in a MySQL database.

## Tech Stack

* Node.js
* Express.js
* MySQL
* GitHub Public API
* Axios

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd github-profile-analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database

Open MySQL and run:

```sql
CREATE DATABASE github_analyzer;
```

### 4. Configure environment variables

Create a `.env` file in the project root and add the following values:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=github_analyzer
GITHUB_TOKEN=your_github_token
```

You can create a GitHub Personal Access Token from GitHub Settings. It helps avoid API rate limits.

### 5. Start the server

```bash
npm run dev
```

or

```bash
npm start
```

The server will run at:

```
http://localhost:3000
```

## API Endpoints

### Analyze and save a GitHub profile

```
POST /api/analyze/:username
```

Example:

```
POST /api/analyze/octocat
```

### Get all analyzed profiles

```
GET /api/profiles
```

### Get a single analyzed profile

```
GET /api/profiles/:username
```

Example:

```
GET /api/profiles/octocat
```

### Delete a profile

```
DELETE /api/profiles/:username
```

## Insights Stored

For each analyzed GitHub user, the following details are stored:

* Username
* Name
* Bio
* Location
* Avatar URL
* Profile URL
* Public repository count
* Followers count
* Following count
* Total stars received
* Total forks
* Top programming languages
* Account age in days
* GitHub joined date
* Analysis timestamp

## Future Improvements

* Add pagination for profile listing
* Improve error handling
* Add API documentation using Swagger

## Author

Saikiran Labhala
