const express = require("express");
const router = express.Router();
const BusinessUnit = require("../models/BusinessUnit");

// CREATE Business Unit
router.post("/", async (req, res) => {
  try {
    const bu = new BusinessUnit(req.body);
    await bu.save();
    res.status(201).json(bu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all Business Units
router.get("/", async (req, res) => {

  try {

    const filter = {};

    if (req.query.clientId) {

      filter.client =
        req.query.clientId;
    }

    const bus =
      await BusinessUnit.find(filter)

        .sort({
          createdAt: -1,
        })

        .populate(
          "accountManagers",
          "name email"
        );

    res.json(bus);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });
  }
});

//
// GET SINGLE BUSINESS UNIT
//

router.get("/:id", async (req, res) => {

  try {

    const bu =
      await BusinessUnit.findById(
        req.params.id
      )

      .populate(
        "accountManagers",
        "name email"
      );

    if (!bu) {

      return res.status(404).json({
        error:
          "Business Unit not found",
      });
    }

    res.json(bu);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });
  }
});
//
// UPDATE BUSINESS UNIT
//

router.put("/:id", async (req, res) => {

  try {

    const updated =
      await BusinessUnit.findByIdAndUpdate(

        req.params.id,

        {
          name:
            req.body.name,

          region:
            req.body.region || "",

          currency:
            req.body.currency || "USD",

          client:
            req.body.client,

          accountManagers:
            req.body.accountManagers || [],

          emails: {

            cc:
              req.body.emails?.cc || [],

            to:
              req.body.emails?.to || [],
          },
        },

        {
          new: true,
          runValidators: true,
        }
      )

      .populate(
        "accountManagers",
        "name email"
      );

    if (!updated) {

      return res.status(404).json({
        error:
          "Business Unit not found",
      });
    }

    res.json(updated);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});
//
// DELETE BUSINESS UNIT
//

router.delete("/:id", async (req, res) => {

  try {

    const deleted =
      await BusinessUnit.findByIdAndDelete(
        req.params.id
      );

    if (!deleted) {

      return res.status(404).json({
        error:
          "Business Unit not found",
      });
    }

    res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});
module.exports = router;