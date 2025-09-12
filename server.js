// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fast2sms = require('fast2sms'); // Fast2SMS SDK

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ⚠️ Use your Fast2SMS API key here
const API_KEY = 'YOUR_FAST2SMS_API_KEY';

// Store OTP temporarily in memory (use DB in real app)
const otpStorage = {}; // Format: { '9876543210': '123456' }

// ✅ Send OTP via Fast2SMS
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStorage[phone] = otp;

  try {
    const response = await fast2sms.sendMessage({
      authorization: API_KEY,
      message: `Your OTP is ${otp}`,
      numbers: [phone]
    });

    console.log("SMS Response:", response);
    res.json({ success: true });
  } catch (err) {
    console.error("SMS error:", err);
    res.status(500).json({ success: false, error: "SMS not sent" });
  }
});

// ✅ Verify OTP
app.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;

  if (otpStorage[phone] && otpStorage[phone] === otp) {
    delete otpStorage[phone]; // Optional: clear OTP after success
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Incorrect OTP' });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
