const express = require("express");

const router = express.Router();

const ProjectType =
  require("../models/ProjectType");

const BusinessUnit =
  require("../models/BusinessUnit");


// =====================================
// GET ALL PROJECT TYPES
// =====================================
router.get("/", async (req, res) => {

  try {

    const data =
      await ProjectType.find()
        .populate("businessUnit");

    return res.json(data);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================
// GET PROJECT TYPES BY BUSINESS UNIT
// =====================================
router.get(
  "/by-business-unit/:id",
  async (req, res) => {

    try {

      const data =
        await ProjectType.find({
          businessUnit:
            req.params.id
        });

      return res.json(data);

    } catch (err) {

      console.error(err);

      return res.status(500).json([]);
    }
  }
);


// =====================================
// CREATE PROJECT TYPE
// =====================================
router.post("/", async (req, res) => {

  try {

    const {
      name,
      businessUnit,
      fields,
    } = req.body;

    if (
      !name ||
      !businessUnit
    ) {

      return res.status(400).json({
        error:
          "Missing required fields",
      });
    }

    const projectType =
      await ProjectType.create({

        name,

        businessUnit,

        fields:
          Array.isArray(fields)
            ? fields
            : [],
      });

    // OPTIONAL:
    // AUTO LINK TO BU
    await BusinessUnit
      .findByIdAndUpdate(
        businessUnit,
        {
          $addToSet: {
            projectTypes:
              projectType._id,
          },
        }
      );

    return res
      .status(201)
      .json(projectType);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================
// UPDATE PROJECT TYPE
// =====================================
router.put("/:id", async (req, res) => {

  try {

    const {
      name,
      fields,
    } = req.body;

    const updated =
      await ProjectType
        .findByIdAndUpdate(
          req.params.id,
          {
            name,
            fields,
          },
          {
            new: true,
            runValidators: true,
          }
        )
        .populate("businessUnit");

    if (!updated) {

      return res.status(404).json({
        error:
          "Project type not found",
      });
    }

    return res.json(updated);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================
// DELETE PROJECT TYPE
// =====================================
router.delete("/:id", async (req, res) => {

  try {

    const deleted =
      await ProjectType
        .findByIdAndDelete(
          req.params.id
        );

    if (!deleted) {

      return res.status(404).json({
        error:
          "Project type not found",
      });
    }

    // REMOVE FROM BU
    await BusinessUnit
      .updateMany(
        {},
        {
          $pull: {
            projectTypes:
              deleted._id,
          },
        }
      );

    return res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;