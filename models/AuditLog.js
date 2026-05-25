const mongoose =
  require("mongoose");

const auditLogSchema =
  new mongoose.Schema({

    action: {
      type: String,
      required: true,
    },

    entityType: {
      type: String,
      required: true,
    },

    entityId: {
      type:
        mongoose.Schema.Types.ObjectId,

      required: true,
    },

    performedBy: {
      type: String,
      default: "system",
    },

    metadata: {
      type: Object,
      default: {},
    },

  }, {
    timestamps: true,
  });

module.exports =
  mongoose.model(
    "AuditLog",
    auditLogSchema
  );