const express = require("express");
const router = express.Router();

const SchemeModal = require("../models/teamSchemes"); //dc this after pushing

router.post("/add", async (req, res) => {
    const data = new SchemeModal({
      schemeName: req.body.teamName,
      description: req.body.description,
      majors: req.body.majors,
    });
    try {
      const dataToSave = await data.save();
      res.status(200).json(dataToSave);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  router.get("/all", async (req, res) => {
    try {
      const data = await SchemeModal.find();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  
module.exports = router;
// add at the end of server...
/*
app.use("/scheme", teamSchemes); // Scheme routes


*/