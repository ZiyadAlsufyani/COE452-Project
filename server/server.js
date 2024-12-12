const express = require("express"); // Define Express
const mongoose = require("mongoose"); // Define Mongoose
const cors = require("cors"); // Import the cors package
const cookieParser = require('cookie-parser'); // Add cookie parser
const jwt = require('jsonwebtoken'); // Add JWT
const teamRoutes = require("./routes/team"); // Team Routes
const studentRoutes = require("./routes/studentRoutes"); // Student Routes
const { router: authRoutes, authMiddleware, JWT_SECRET } = require('./routes/authRoutes'); // Authentication Routes
const path = require('path'); // Import path module
// const teamSchemes = require("./routes/teamSchemes"); // Scheme Routes

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database Connected");
  }).catch((error) => {
    console.log("Database Connection Error:", error);
  });

// Initialize Express
const app = express(); // An instance of the express application

// Middleware order is important
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Add cookie parsing

// Public routes
app.use('/auth', authRoutes);

// Add this middleware to protect HTML files
const protectHtmlRoutes = (req, res, next) => {
  const publicFiles = ['/loginPage.html', '/createaccountpage.html', '/'];
  console.log(`Request path: ${req.path}`); // Log the requested path

  if (publicFiles.includes(req.path)) {
    return next();
  }

  if (req.path.endsWith('.html')) {
    const token = req.cookies?.token;
    console.log(`Token: ${token}`);

    if (!token) {
      console.log('No token, redirecting to login page.');
      return res.redirect('/loginPage.html');
    }
    try {
      // Store the decoded token
      const decodedToken = jwt.verify(token, JWT_SECRET);
      console.log('Token verified, proceeding.');
      console.log('User role:', decodedToken.role);

      // Check if the path is 'admin-view-teams.html' and role is not 'admin'
      if (req.path === '/admin-view-teams.html' && decodedToken.role !== 'admin') {
        console.log('Access denied: insufficient permissions');
        return res.status(403).send('Access denied');
      }

      if ((req.path === '/student-homepage.html' || req.path === '/student-team-proposals.html') && decodedToken.role !== 'student') {
        console.log('Access denied: insufficient permissions');
        return res.status(403).send('Access denied');
      }

      next();
    } catch (error) {
      console.log('Token verification failed:', error.message);
      res.clearCookie('token');
      return res.redirect('/loginPage.html');
    }
  } else {
    next();
  }
};

// Protect HTML routes
app.use(protectHtmlRoutes);

// Protected routes
app.use('/team', authMiddleware, teamRoutes);
app.use('/student', authMiddleware, studentRoutes);
// app.use('/scheme', authMiddleware, schemeRoutes);

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve index.html for SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loginPage.html'));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});
