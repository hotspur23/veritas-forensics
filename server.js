const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Contact form submission endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, phone, 'inquiry-type': inquiryType, message } = req.body;

  // Validate required fields
  const errors = [];
  if (!name || !name.trim()) errors.push('Name is required');
  if (!email || !email.trim()) errors.push('Email is required');
  if (!message || !message.trim()) errors.push('Message is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Build submission record
  const submission = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : '',
    inquiryType: inquiryType || 'other',
    message: message.trim(),
    receivedAt: new Date().toISOString()
  };

  // Store submission (append to JSON file)
  const dataDir = path.join(__dirname, '_data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const submissionsPath = path.join(dataDir, 'submissions.json');
  let submissions = [];
  try {
    const existing = fs.readFileSync(submissionsPath, 'utf-8');
    submissions = JSON.parse(existing);
  } catch {
    submissions = [];
  }
  submissions.push(submission);

  fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));

  console.log(`[Contact] New submission from ${submission.name} <${submission.email}>`);

  res.json({
    success: true,
    message: 'Thank you for your message. A member of our team will respond within 1-2 business days.'
  });
});

// Fallback: serve index.html for unmatched routes (SPA-style)
app.use((req, res) => {
  // Don't intercept API routes or static files that genuinely don't exist
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Veritas Forensics website running at http://0.0.0.0:${PORT}`);
});