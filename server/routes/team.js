const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../routes/authRoutes');

const TeamModal = require("../models/team");

// //Handle adding new items
// router.post("/add", async (req, res) => {
//   const data = new TeamModal({
//     teamName: req.body.teamName,
//     description: req.body.description,
//     majors: req.body.majors,
//   });
//   try {
//     const dataToSave = await data.save();
//     res.status(200).json(dataToSave);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Route to handle creating multiple teams
// router.post("/bulk", async (req, res) => {
//     try {
//       const teams = req.body;
//       const createdTeams = await TeamModal.insertMany(teams);
//       res.status(201).json(createdTeams);
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   });

//Get All Items
router.get("/all", async (req, res) => {
  try {
    const data = await TeamModal.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin role verification middleware
const adminMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Route to handle deleting a team
router.delete("/delete/:id", adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedTeam = await TeamModal.findByIdAndDelete(id);
    if (!deletedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add join request endpoint
router.post("/join/:teamId", async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const studentId = req.body.studentId;
    
    const team = await TeamModal.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    await team.addRequest(studentId);
    res.status(200).json({ success: true, message: "Join request sent successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Add new endpoint to get all teams with request status
router.get("/all/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Find all teams where student is not a member
    const teams = await TeamModal.find({
      members: { $ne: studentId } // Exclude teams where student is a member
    });

    // Add request status for each team
    const teamsWithStatus = teams.map(team => ({
      ...team.toObject(),
      hasRequestPending: team.checkRequestStatus(studentId)
    }));

    res.json(teamsWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
