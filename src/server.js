const express = require('express');
const cors = require('cors');
require('dotenv').config();

const profileRoutes = require('./routes/profileRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', profileRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'GitHub Profile Analyzer API',
    routes: {
      analyze: 'POST /api/analyze/:username',
      getAllProfiles: 'GET /api/profiles',
      getSingleProfile: 'GET /api/profiles/:username',
      deleteProfile: 'DELETE /api/profiles/:username'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});