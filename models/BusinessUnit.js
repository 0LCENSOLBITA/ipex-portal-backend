const mongoose = require("mongoose");

const businessUnitSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      region: {
        type: String,
        default: "",
      },

      currency: {
        type: String,
        default: "USD",
      },

      client: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Client",

        required: true,
      },

      accountManagers: [
        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",
        },
      ],

      emails: {
        to: {
          type: [String],
          default: [],
        },

        cc: {
          type: [String],
          default: [],
        },
      },

      submissionCount: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "BusinessUnit",
    businessUnitSchema
  );