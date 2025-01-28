const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const twoFactor = require('node-2fa');
const qrcode = require('qrcode');

const app = express();
const upload = multer();

app.use(bodyParser.json());
app.use(upload.none()); // Use multer to parse form-data

// Set view engine to pug
app.set('view engine', 'pug');
app.set('views', './views');

const users = {}; // This will store users, replace with a proper DB in a real application

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Generate a secret for a user and render QR code
app.post('/generate-secret', async (req, res) => {
  const { username } = req.body;
  const newSecret = twoFactor.generateSecret({ name: "2FA-Example", account: username });
  users[username] = { secret: newSecret.secret };

  qrcode.toDataURL(newSecret.uri, (err, url) => {
    if (err) {
      res.status(500).json({ message: "Error generating QR code" });
    } else {
      res.render('qrcode', { qrUrl: url, setupKey: newSecret.secret });
    }
  });
});

// Verify token
app.post('/verify', (req, res) => {
  const { username, token } = req.body;

  // Check if username and token are provided
  if (!username || !token) {
    return res.status(400).json({ message: "Username and token are required" });
  }

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
