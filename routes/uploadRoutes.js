const express = require("express");

const router = express.Router();

const upload =
  require("../middleware/upload");

router.post(
  "/",
  upload.array("files"),

  (req, res) => {

    const files =
      req.files || [];

    const formatted =
      files.map((f) => ({
        name:
          f.originalname,

        filename:
          f.filename,

        path:
          f.path,
      }));

    res.json(
      formatted
    );
  }
);

module.exports = router;