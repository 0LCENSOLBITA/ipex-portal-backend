const express = require("express");

const router = express.Router();

const Client = require("../models/Client");

//
// GET ALL CLIENTS
//

router.get("/", async (req, res) => {
  try {

    const clients =
      await Client.find().sort({
        createdAt: -1,
      });

    res.json(clients);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

//
// CREATE CLIENT
//

router.post("/", async (req, res) => {
  try {

    const existing =
      await Client.findOne({
        $or: [
          { name: req.body.name },
          { subdomain: req.body.subdomain },
        ],
      });

    if (existing) {
      return res.status(400).json({
        error: "Client already exists",
      });
    }

    const client =
      await Client.create({

        name: req.body.name,

        prefix: req.body.prefix,

        subdomain: req.body.subdomain,

        branding: {
          logo:
            req.body.branding?.logo || "",

          colors: {
            primary:
              req.body.branding?.colors?.primary || "",

            secondary:
              req.body.branding?.colors?.secondary || "",
          },
        },

        emailSenderName:
          req.body.emailSenderName || "",

        rateCard: {
          CAD:
            req.body.rateCard?.CAD || 0,

          USD:
            req.body.rateCard?.USD || 0,
        },

     lineItems:
  (req.body.lineItems || [])
    .map((item) =>
      typeof item === "string"
        ? item
        : item.name
    )
    .filter(Boolean),
      });

    res.status(201).json(client);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

//
// UPDATE CLIENT
//

router.put("/:id", async (req, res) => {
  try {

    const updated =
      await Client.findByIdAndUpdate(

        req.params.id,

        {

          name: req.body.name,

          prefix: req.body.prefix,

          subdomain:
            req.body.subdomain,

          branding: {
            logo:
              req.body.branding?.logo || "",

            colors: {
              primary:
                req.body.branding?.colors?.primary || "",

              secondary:
                req.body.branding?.colors?.secondary || "",
            },
          },

          emailSenderName:
            req.body.emailSenderName || "",

          rateCard: {
            CAD:
              req.body.rateCard?.CAD || 0,

            USD:
              req.body.rateCard?.USD || 0,
          },

       lineItems:
  (req.body.lineItems || [])
    .map((item) =>
      typeof item === "string"
        ? item
        : item.name
    )
    .filter(Boolean),
        },

        {
          new: true,
          runValidators: true,
        }
      );

    if (!updated) {
      return res.status(404).json({
        error: "Client not found",
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
// DELETE CLIENT
//

router.delete("/:id", async (req, res) => {
  try {

    const deleted =
      await Client.findByIdAndDelete(
        req.params.id
      );

    if (!deleted) {
      return res.status(404).json({
        error: "Client not found",
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
//
// UPDATE PRICING
//

router.patch(
  "/:id/pricing",
  async (req, res) => {
    try {

      const updated =
        await Client.findByIdAndUpdate(

          req.params.id,

          {
            rateCard: {
              CAD:
                req.body.rateCard?.CAD || 0,

              USD:
                req.body.rateCard?.USD || 0,
            },

          lineItems:
  (req.body.lineItems || [])
    .map((item) =>
      typeof item === "string"
        ? item
        : item.name
    )
    .filter(Boolean),
          },

          {
            new: true,
            runValidators: true,
          }
        );

      if (!updated) {
        return res.status(404).json({
          error:
            "Client not found",
        });
      }

      res.json(updated);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message,
      });
    }
  }
);
module.exports = router;