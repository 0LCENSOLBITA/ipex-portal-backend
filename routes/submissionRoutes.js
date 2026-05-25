const express = require("express");
const router = express.Router();

const Submission = require("../models/Submission");
const BusinessUnit = require("../models/BusinessUnit");
const Client = require("../models/Client");
const User =
  require("../models/User");

// 🔥 CREATE Submission with auto-number
router.post("/", async (req, res) => {
  try {
    const {
  projectType,
  businessUnit,
  client,
  data,
  attachments,
  quote,
  aiAnswers,
} = req.body;

    // ✅ VALIDATION
    if (!businessUnit || !client || !projectType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ FETCH BU + CLIENT
    const bu = await BusinessUnit.findById(businessUnit);
    if (!bu) return res.status(404).json({ error: "BusinessUnit not found" });

    const cl = await Client.findById(client);
    if (!cl) return res.status(404).json({ error: "Client not found" });

    // 🔥 SAFE INCREMENT (atomic)
    const updatedBU = await BusinessUnit.findByIdAndUpdate(
      businessUnit,
      { $inc: { submissionCount: 1 } },
      { new: true }
    );

    const padded = String(updatedBU.submissionCount).padStart(4, "0");

    // 🔥 CLIENT CODE
    const clientCode = (cl.subdomain || "GEN").toUpperCase();

    // 🔥 BU CODE (first letters)
    const buCode = bu.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();

    // 🔥 FINAL ID
    const submissionNumber = `${clientCode}-${buCode}-${padded}`;

    // ✅ NORMALIZE ATTACHMENTS
const normalizedAttachments =
  (attachments || []).map((a) => ({

    filename:
      a.filename ||
      a.name ||
      "file",

    originalname:
      a.originalname ||
      a.name ||
      "file",

    description:
      a.description || "",

    path:
      a.path || "",
  }));
const businessUnitDoc =
  await BusinessUnit.findById(
    req.body.businessUnit
  );

let assignedAM = null;

if (
  businessUnitDoc &&
  businessUnitDoc.accountManagers
    ?.length
) {

  assignedAM =
    await User.findOne({

      email: {
        $in:
       businessUnitDoc.accountManagers
      },

      role:
        "account_manager",

      isActive: true,
    });
}
    // 🔥 CREATE DOCUMENT
  const submission = new Submission({

  projectType,

  businessUnit,

  client,

  assignedAccountManager:
    assignedAM?._id,

  submissionNumber,

  data,

  quote,

  aiAnswers,

  attachments:
    normalizedAttachments,

  status: "Pending",
});

    await submission.save();
console.log(
  "SAVED QUOTE:",
  submission.quote
);

console.log(
  "SAVED AI:",
  submission.aiAnswers
);

console.log(
  "SAVED PT:",
  submission.projectType
);
    // ✅ RETURN CLEAN RESPONSE (IMPORTANT)
    res.status(201).json({
      submissionNumber: submission.submissionNumber,
      id: submission._id,
    });

  } catch (err) {
    console.error("CREATE SUBMISSION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🔥 GET ALL
router.get("/", async (req, res) => {

  try {

    const {
      role,
      userId,
    } = req.query;

    let query = {};

// ACCOUNT MANAGER
if (
  role ===
  "account_manager"
) {

  const user =
    await User.findById(
      userId
    );

  query = {

    assignedAccountManager:
      userId,

    businessUnit: {
      $in:
        user.assignedBusinessUnits,
    },
  };
}

    const subs =
      await Submission.find(
        query
      )

        .populate("client")

        .populate(
          "businessUnit"
        )
.populate({
  path: "projectType",
  select: "name",
})
        .populate(
          "assignedAccountManager",
          "name email"
        )

        .sort({
          createdAt: -1,
        });

    res.json(subs);

  } catch (err) {

    console.error(
      "GET SUBMISSIONS ERROR:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});

// 🔥 UPDATE STATUS
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Submission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;