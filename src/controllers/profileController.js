const axios = require('axios');
const db = require('../config/db');

async function getGithubData(username) {
  const headers = {};

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const profileResponse = await axios.get(
    `https://api.github.com/users/${username}`,
    { headers }
  );

  const reposResponse = await axios.get(
    `https://api.github.com/users/${username}/repos?per_page=100`,
    { headers }
  );

  return {
    profile: profileResponse.data,
    repos: reposResponse.data
  };
}

function getTotalStars(repos) {
  let total = 0;

  for (let i = 0; i < repos.length; i++) {
    total += repos[i].stargazers_count;
  }

  return total;
}

function getTotalForks(repos) {
  let total = 0;

  for (let i = 0; i < repos.length; i++) {
    total += repos[i].forks_count;
  }

  return total;
}

function getTopLanguages(repos) {
  const langCount = {};

  for (let i = 0; i < repos.length; i++) {
    const lang = repos[i].language;

    if (lang) {
      if (langCount[lang]) {
        langCount[lang]++;
      } else {
        langCount[lang] = 1;
      }
    }
  }

  const sorted = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, count]) => `${lang}(${count})`);

  return sorted.join('| ');
}

function getAccountAgeDays(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now - created;

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function fetchAndReturn(username, res, message) {
  const query = 'SELECT * FROM github_profiles WHERE username = ?';

  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching saved profile'
      });
    }

    return res.status(201).json({
      success: true,
      message: message,
      data: results[0]
    });
  });
}

exports.analyzeProfile = async (req, res) => {
  const username = req.params.username;

  try {
    const { profile, repos } = await getGithubData(username);

    const totalStars = getTotalStars(repos);
    const totalForks = getTotalForks(repos);
    const topLanguages = getTopLanguages(repos);
    const accountAgeDays = getAccountAgeDays(profile.created_at);

    const checkQuery =
      'SELECT id FROM github_profiles WHERE username = ?';

    db.query(checkQuery, [username], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }

      if (results.length > 0) {
        const updateQuery = `
          UPDATE github_profiles SET
            name = ?, bio = ?, location = ?, avatar_url = ?, profile_url = ?,
            public_repos = ?, followers = ?, following = ?,
            total_stars = ?, total_forks = ?, top_languages = ?,
            account_age_days = ?, github_joined_at = ?,
            analyzed_at = NOW()
          WHERE username = ?
        `;

        const values = [
          profile.name,
          profile.bio,
          profile.location,
          profile.avatar_url,
          profile.html_url,
          profile.public_repos,
          profile.followers,
          profile.following,
          totalStars,
          totalForks,
          topLanguages,
          accountAgeDays,
          profile.created_at,
          username
        ];

        db.query(updateQuery, values, err => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Failed to update profile',
              error: err.message
            });
          }

          fetchAndReturn(
            username,
            res,
            'Profile updated successfully'
          );
        });
      } else {
        const insertQuery = `
          INSERT INTO github_profiles
            (
              username,
              name,
              bio,
              location,
              avatar_url,
              profile_url,
              public_repos,
              followers,
              following,
              total_stars,
              total_forks,
              top_languages,
              account_age_days,
              github_joined_at
            )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          username,
          profile.name,
          profile.bio,
          profile.location,
          profile.avatar_url,
          profile.html_url,
          profile.public_repos,
          profile.followers,
          profile.following,
          totalStars,
          totalForks,
          topLanguages,
          accountAgeDays,
          profile.created_at
        ];

        db.query(insertQuery, values, err => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Failed to save profile',
              error: err.message
            });
          }

          fetchAndReturn(
            username,
            res,
            'Profile analyzed and saved successfully'
          );
        });
      }
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: `GitHub user '${username}' not found`
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch GitHub data',
      error: err.message
    });
  }
};

exports.getAllProfiles = (req, res) => {
  const query =
    'SELECT * FROM github_profiles ORDER BY analyzed_at DESC';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    return res.json({
      success: true,
      total: results.length,
      data: results
    });
  });
};

exports.getSingleProfile = (req, res) => {
  const username = req.params.username;

  const query =
    'SELECT * FROM github_profiles WHERE username = ?';

  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Profile not found. Use POST /api/analyze/${username} first.`
      });
    }

    return res.json({
      success: true,
      data: results[0]
    });
  });
};

exports.deleteProfile = (req, res) => {
  const username = req.params.username;

  const query =
    'DELETE FROM github_profiles WHERE username = ?';

  db.query(query, [username], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    return res.json({
      success: true,
      message: `Profile '${username}' deleted successfully`
    });
  });
};