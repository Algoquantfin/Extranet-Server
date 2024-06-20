const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Adjust path as necessary

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for JSON body parsing
app.use(express.json());

// Dummy users data (replace with database logic)
const users = [
  { username: 'devansh', password: '12345' },
  { username: 'dhruv', password: '12345' },
];

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Simulated database check (replace with actual MongoDB query)
  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Simulated password check (replace with bcrypt compare)
  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  res.json({ message: 'Login successful' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
