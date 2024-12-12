// const mongoose = require("mongoose");

// const schemeSchema = new mongoose.Schema({ //in hindesight, not the best naming convention :/

//     schemeName: {
//         required: true,
//         type: String,
//       },
//       description: {
//         required: true,
//         type: String,
//       },
//       majors: {
//         required: true,
//         type: [String],
//       }
     
//     }, {
//       timestamps: true //consider
//     });
    

//     //consider adding methods if neccessary

//     //Add major to major list
//     schemeSchema.methods.addMajor = async function(majorToBeAdded) {
//         if (!this.majors.includes(majorToBeAdded)) {
//           // Add to the major
//           this.members.push(studentId);
//           await this.save();
//         }
//       };

//     //Remove major from major list
//     schemeSchema.methods.removeMember = async function(majorToBeRemoved) {
//         this.majors = this.majors.filter(major => !major.equals(majorToBeRemoved));
//         await this.save();
//       };


//     //Check if a major is in the major list
//     schemeSchema.methods.checkIfMajorIsIncluded = function(majorForChecking) {
//         return this.majors.some(major => major.equals(majorForChecking));
//       };
      



// const Team = mongoose.model("Scheme", schemeSchema);
// module.exports = Team;
