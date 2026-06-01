const express = require("express");

const router =
  express.Router();

const upload =
  require(
    "../middleware/upload"
  );

router.post(
  "/",

  upload.array(
    "files"
  ),

  (req, res) => {

    const files =
      req.files || [];

    const formatted =
      files.map(
        (f) => ({

          filename:
            f.filename,

          originalname:
            f.originalname,

          description:
            "",

          path:
            `/uploads/${f.filename}`,
        })
      );

    res.json(
      formatted
    );
  }
);

module.exports =
  router;