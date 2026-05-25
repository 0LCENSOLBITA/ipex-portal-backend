const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    prefix: {
      type: String,
      default: "",
      trim: true,
    },

  subdomain: {
  type: String,
  sparse: true,
  trim: true,
},

    branding: {
      logo: {
        type: String,
        default: "",
      },

      colors: {
        primary: {
          type: String,
          default: "",
        },

        secondary: {
          type: String,
          default: "",
        },
      },
    },

    emailSenderName: {
      type: String,
      default: "",
    },

    rateCard: {
      CAD: {
        type: Number,
        default: 0,
      },

      USD: {
        type: Number,
        default: 0,
      },
    },

    lineItems: {
      type: [String],
      default: [],
    },

    accessModel: {
      type: String,
      enum: ["open", "authenticated"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Client",
  clientSchema
);