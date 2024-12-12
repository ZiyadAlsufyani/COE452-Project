const mongoose = require("mongoose");

// Create the student schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  whatsappNumber: {
    type: String,
    required: [true, "WhatsApp number is required"],
    trim: true,
    match: [/^\+?[0-9]{10,}$/, 'Please fill a valid phone number']
  },
  major: {
    type: String, 
    required: [true, "Major is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  batchYear: {
    type: Number,
    required: [true, "Batch year is required"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8
  },
  // profilePicture: {
  //   type: String,
  //   default: "account_circle.svg"
  // },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  }
}, {
  timestamps: true
});

// Add these methods to the schema before creating the model
studentSchema.methods.joinTeam = async function(teamId) {
  if (this.teamId) {
    throw new Error('Student is already in a team');
  }
  this.teamId = teamId;
  await this.save();
  return this;
};

studentSchema.methods.leaveTeam = async function() {
  if (!this.teamId) {
    throw new Error('Student is not in a team');
  }
  this.teamId = null;
  await this.save();
  return this;
};

// Create the model
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

// Usage example:
/*
const student = await Student.findById(studentId);
await student.joinTeam(teamId);
// or
await student.leaveTeam();
*/
