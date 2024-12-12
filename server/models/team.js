const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  teamName: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  majors: {
    required: true,
    type: [String],
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  pendingRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, {
  timestamps: true
});

// Static method to remove student requests from all teams
teamSchema.statics.removeRequestsFromAllTeams = async function(studentId) {
  await this.updateMany(
    { pendingRequests: studentId },
    { $pull: { pendingRequests: studentId } }
  );
};

// Method to add a student to team
teamSchema.methods.addMember = async function(studentId) {
  if (!this.members.includes(studentId)) {
    // Add to members
    this.members.push(studentId);
    // Remove from pending if exists
    this.pendingRequests = this.pendingRequests.filter(id => !id.equals(studentId));
    // Remove student's requests from all other teams
    await this.constructor.removeRequestsFromAllTeams(studentId);
    await this.save();
  }
};

// Method to remove a student from team
teamSchema.methods.removeMember = async function(studentId) {
  this.members = this.members.filter(id => !id.equals(studentId));
  await this.save();
};

// Method to add join request
teamSchema.methods.addRequest = async function(studentId) {
  if (!this.pendingRequests.includes(studentId) && !this.members.includes(studentId)) {
    this.pendingRequests.push(studentId);
    await this.save();
  }
};

// Method to remove join request
teamSchema.methods.removeRequest = async function(studentId) {
  this.pendingRequests = this.pendingRequests.filter(id => !id.equals(studentId));
  await this.save();
};

// Method to accept join request
teamSchema.methods.acceptRequest = async function(studentId) {
  if (this.pendingRequests.includes(studentId)) {
    await this.addMember(studentId);
  } else {
    throw new Error('No pending request found for this student');
  }
};

// Method to reject join request
teamSchema.methods.rejectRequest = async function(studentId) {
  await this.removeRequest(studentId);
};

// Method to check request status
teamSchema.methods.checkRequestStatus = function(studentId) {
  return this.pendingRequests.some(id => id.equals(studentId));
};

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;