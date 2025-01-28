const express = require('express');
const bodyParser = require('body-parser');
const twoFactor = require('node-2fa');

const app = express();
app.use(bodyParser.json());

const users = {}; // This will store users, replace with a proper DB in a real application

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Generate a secret for a user
app.post('/generate-secret', (req, res) => {
  const { username } = req.body;
  const newSecret = twoFactor.generateSecret({ name: "MyApp", account: username });
  users[username] = { secret: newSecret.secret };
  res.json(newSecret);
});

// Verify token
app.post('/verify', (req, res) => {
  const { username, token } = req.body;
  const user = users[username];
  if (user) {
    const result = twoFactor.verifyToken(user.secret, token);
    res.json({ verified: result !== null && result.delta === 0 });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
