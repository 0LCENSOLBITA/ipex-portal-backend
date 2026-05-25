const express =
  require("express");

const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();

//
// LOGIN
//

router.post(
  "/login",

  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {

        return res
          .status(401)
          .json({
            error:
              "Invalid credentials",
          });
      }

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!validPassword) {

        return res
          .status(401)
          .json({
            error:
              "Invalid credentials",
          });
      }

      if (!user.isActive) {

        return res
          .status(403)
          .json({
            error:
              "User inactive",
          });
      }

      const token =
        jwt.sign(

          {
            id: user._id,
            role: user.role,
          },

          process.env.JWT_SECRET,

          {
            expiresIn: "7d",
          }
        );

      res.json({

        token,

        user: {
          _id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          assignedBusinessUnits:
            user.assignedBusinessUnits,

          createdAt:
            user.createdAt,
        },
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error:
          "Login failed",
      });
    }
  }
);

//
// CHANGE PASSWORD
//

router.put(
  "/change-password",

  authMiddleware,

  async (req, res) => {

    try {

      const {
        currentPassword,
        newPassword,
      } = req.body;

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {

        return res.status(404).json({
          error: "User not found",
        });
      }

      const valid =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!valid) {

        return res.status(400).json({
          error:
            "Current password is incorrect",
        });
      }

      const hashed =
        await bcrypt.hash(
          newPassword,
          10
        );

      user.password =
        hashed;

      await user.save();

      res.json({
        success: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error:
          "Server error",
      });
    }
  }
);

module.exports =
  router;