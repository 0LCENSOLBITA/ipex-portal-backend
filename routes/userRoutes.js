const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const BusinessUnit =
  require("../models/BusinessUnit");
const AuditLog =
  require("../models/AuditLog");
  const authMiddleware =
  require("../middleware/authMiddleware");

const roleMiddleware =
  require("../middleware/roleMiddleware");
const router = express.Router();

//
// GET USERS
//

router.get(
  "/",
  async (req, res) => {
  try {

    const users =
      await User.find()
        .populate(
          "assignedBusinessUnits",
          "name"
        )
        .sort({
          createdAt: -1,
        });

    res.json(users);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error:
        "Failed to fetch users",
    });
  }
});

router.post(
  "/",
  async (req, res) => {
  try {

    const {
      name,
      email,
      password,
      role,
      assignedBusinessUnits,
      isActive,
    } = req.body;

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res
        .status(400)
        .json({
          error:
            "User already exists",
        });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name,
        email,
        password:
          hashedPassword,
        role,
        assignedBusinessUnits,
        isActive,
      });
      if (
  role ===
  "account_manager"
) {

  await BusinessUnit.updateMany(
    {
      _id: {
        $in:
          assignedBusinessUnits,
      },
    },
    {
      $addToSet: {
        accountManagers:
          user._id,
      },
    }
  );
}
await AuditLog.create({

  action:
    "USER_CREATED",

  entityType:
    "User",

  entityId:
    user._id,

  metadata: {
    email: user.email,
    role: user.role,
  },
});
    res.json(user);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error:
        "Failed to create user",
    });
  }
});

router.put(

  "/:id",

  async (req, res) => {
  try {

    const {
      name,
      email,
      role,
      assignedBusinessUnits,
      isActive,
    } = req.body;

    const updatedUser =
      await User.findByIdAndUpdate(
        req.params.id,
        {
          name,
          email,
          role,
          assignedBusinessUnits,
          isActive,
        },
        {
          new: true,
        }
      ).populate(
        "assignedBusinessUnits",
        "name"
      );
      await BusinessUnit.updateMany(
  {},
  {
    $pull: {
      accountManagers:
        updatedUser._id,
    },
  }
);

if (
  role ===
  "account_manager"
) {

  await BusinessUnit.updateMany(
    {
      _id: {
        $in:
          assignedBusinessUnits,
      },
    },
    {
      $addToSet: {
        accountManagers:
          updatedUser._id,
      },
    }
  );
}
await AuditLog.create({

  action:
    "USER_UPDATED",

  entityType:
    "User",

  entityId:
    updatedUser._id,

  metadata: {
    email: updatedUser.email,
    role: updatedUser.role,
  },
});
    res.json(updatedUser);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error:
        "Failed to update user",
    });
  }
});

router.delete(

  "/:id",

  async (req, res) => {

  try {

    const user =
      await User.findByIdAndUpdate(
        req.params.id,
        {
          isActive: false
        },
        { new: true }
      );
await AuditLog.create({

  action:
    "USER_DEACTIVATED",

  entityType:
    "User",

  entityId:
    user._id,

  metadata: {
    email: user.email,
  },
});
    res.json(user);

  } catch (err) {

    res.status(500).json({
      message:
        "Failed to deactivate user"
    });
  }
});

module.exports = router;