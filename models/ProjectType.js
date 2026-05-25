const mongoose = require("mongoose");

const fieldSchema =
  new mongoose.Schema({

    name: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "text",
        "textarea",
        "number",
        "select",
        "date",
        "email",
      ],
      default: "text",
    },

    required: {
      type: Boolean,
      default: false,
    },

    options: [
      String,
    ],

  });

const projectTypeSchema =
  new mongoose.Schema({

    name: {
      type: String,
      required: true,
    },

    businessUnit: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
    },

    fields: [
      fieldSchema,
    ],

    description: String,

    basePrice: Number,

  }, {
    timestamps: true,
  });

module.exports =
  mongoose.model(
    "ProjectType",
    projectTypeSchema
  );