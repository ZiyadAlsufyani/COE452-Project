// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const Team = require("../models/team");

// Get student profile
router.get("/profile/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student profile
router.put("/profile/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        whatsappNumber: req.body.whatsappNumber,
        major: req.body.major,
        description: req.body.description
      },
      { new: true }
    );
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update profile picture
// router.put("/profile/:id/picture", async (req, res) => {
//   try {
//     const student = await Student.findByIdAndUpdate(
//       req.params.id,
//       { profilePicture: req.body.profilePicture },
//       { new: true }
//     );
//     res.json(student);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// Create new team
router.post("/team/create", async (req, res) => {
  try {
    const team = new Team({
      teamName: req.body.teamName,
      description: req.body.description,
      majors: req.body.majors,
      members: [req.body.studentId] // Creator becomes first member
    });
    
    const savedTeam = await team.save();
    
    // Update student's team
    await Student.findByIdAndUpdate(
      req.body.studentId,
      { teamId: savedTeam._id }
    );
    
    res.status(201).json(savedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Modified Get student's team details route
router.get("/team/:studentId", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    
    // Check if student exists
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if student has a team
    if (!student.teamId) {
      return res.json({ hasTeam: false });
    }
    
    // Try to find the team
    const team = await Team.findById(student.teamId)
      .populate('members', 'name major whatsappNumber description')
      .populate('pendingRequests', 'name major whatsappNumber description');
      
    // If team doesn't exist but student has teamId, reset student's teamId
    if (!team) {
      student.teamId = null;
      await student.save();
      return res.json({ hasTeam: false });
    }
    
    // Return team details if everything is valid
    res.json({
      hasTeam: true,
      team: team
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request to join team
router.post("/team/:teamId/request", async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    await team.addRequest(req.body.studentId);
    res.json({ message: "Request sent successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Accept team request
router.post("/team/:teamId/accept/:studentId", async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    await team.acceptRequest(req.params.studentId);
    
    // Update student's team
    await Student.findByIdAndUpdate(
      req.params.studentId,
      { teamId: team._id }
    );
    
    res.json({ message: "Request accepted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reject team request
router.post("/team/:teamId/reject/:studentId", async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    await team.rejectRequest(req.params.studentId);
    res.json({ message: "Request rejected successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Leave/Delete team
router.delete("/team/:teamId/leave/:studentId", async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    await team.removeMember(req.params.studentId);
    
    // Update student
    await Student.findByIdAndUpdate(
      req.params.studentId,
      { teamId: null }
    );
    
    // If team is empty, delete it
    if (team.members.length === 0) {
      await Team.findByIdAndDelete(req.params.teamId);
    }
    
    
    res.json({ message: "Left team successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new student
router.post('/add', async (req, res) => {
    try {
        // Create new student from request body
        const student = new Student({
            name: req.body.name,
            email: req.body.email,
            whatsappNumber: req.body.whatsappNumber,
            major: req.body.major,
            description: req.body.description,
            batchYear: req.body.batchYear,
            password: req.body.password
        });

        // Save to database
        const savedStudent = await student.save();

        // Return student without password
        const studentResponse = savedStudent.toObject();
        delete studentResponse.password;
        
        res.status(201).json(studentResponse);

    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email already exists' });
        } else {
            res.status(500).json({ 
                message: 'Error creating student',
                error: error.message 
            });
        }
    }
});

module.exports = router;