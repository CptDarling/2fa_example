const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const twoFactor = require('node-2fa');
const qrcode = require('qrcode');
const mongoose = require('mongoose');
const User = require('./models/user');

const app = express();
const upload = multer();

app.use(bodyParser.json());
app.use(upload.none()); // Use multer to parse form-data

// Connect to MongoDB
const connectWithRetry = () => {
  mongoose.connect('mongodb://localhost:27017/2fa_project', {
    serverSelectionTimeoutMS: 5000 // Set timeout to 5 seconds
  })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB', err);
      setTimeout(connectWithRetry, 5000); // Retry connection every 5 seconds
    });
};
connectWithRetry();

// Set view engine to pug
app.set('view engine', 'pug');
app.set('views', './views');

// Provide a little homepage
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Generate a secret for a user and render QR code
app.post('/generate-secret', async (req, res) => {
  const { username } = req.body;
  const newSecret = twoFactor.generateSecret({ name: "2FA-Example", account: username });

  try {
    const user = new User({ username, secret: newSecret.secret });
    await user.save();
    qrcode.toDataURL(newSecret.uri, (err, url) => {
      if (err) {
        res.status(500).json({ message: "Error generating QR code" });
      } else {
        res.render('qrcode', { qrUrl: url, setupKey: newSecret.secret });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving user" });
  }
});

// Verify token
app.post('/verify', async (req, res) => {
  const { username, token } = req.body;

  // Check if username and token are provided
  if (!username || !token) {
    return res.status(400).json({ message: "Username and token are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (user) {
      const result = twoFactor.verifyToken(user.secret, token);
      res.json({ verified: result !== null && result.delta === 0 });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error verifying token" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "An error occurred", error: err.message });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
