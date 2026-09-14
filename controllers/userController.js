const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      // archived: false,
    })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      archived: false,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, username, email, password, role } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, username, email and password are required",
      });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username can contain only lowercase letters, numbers and underscores",
      });
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 30 characters",
      });
    }

    if (role && !["admin", "contributor", "viewer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.username === normalizedUsername
            ? "Username already exists"
            : "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "viewer",
      archived: false,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      archived: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, username, email, password, role } = req.body;

    if (role && !["admin", "contributor", "viewer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (username) {
      const normalizedUsername = username.toLowerCase().trim();

      if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
        return res.status(400).json({
          success: false,
          message:
            "Username can contain only lowercase letters, numbers and underscores",
        });
      }

      const existingUsername = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: id },
      });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }

      user.username = normalizedUsername;
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      user.email = normalizedEmail;
    }

    if (name) {
      user.name = name.trim();
    }

    if (role) {
      user.role = role;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

exports.archiveUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot archive your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.archived) {
      return res.status(400).json({
        success: false,
        message: "User is already archived",
      });
    }

    user.archived = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User archived successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.restoreUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.archived) {
      return res.status(400).json({
        success: false,
        message: "User is already active",
      });
    }

    user.archived = false;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User restored successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getArchivedUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      archived: true,
    })
      .select("-password")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User permanently deleted",
    });
  } catch (error) {
    next(error);
  }
};
