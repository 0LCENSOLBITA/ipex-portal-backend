const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    businessUnit: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessUnit" },
    projectType: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectType" },
assignedAccountManager: {
  type:
    mongoose.Schema.Types.ObjectId,

  ref: "User",
},

businessUnit: {
  type:
    mongoose.Schema.Types.ObjectId,

  ref: "BusinessUnit",
},
    submissionNumber: String,

    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "In Progress", "Completed"],
    },

    data: Object,

    quote: {
      price: Number,
      reason: String,
      breakdown: Array,
    },

    aiAnswers: {
      type: Object,
      default: {},
    },

    // ✅ ADD THIS
    attachments: [
      {
        filename: String,
        originalname: String,
        path: String,
        description: String,
      },
    ],
  },
  { timestamps: true }
 
);

module.exports = mongoose.model("Submission", submissionSchema);