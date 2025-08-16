const { User } = require("../Models/User");
const PendingUser = require("../Models/PendingUsers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const classInfo = require("../Models/Class");
const ProfilePhoto = require("../Models/ProfilePicture");

/**
 * Register user Function
 * Logs in the user after registration
 */
const registerUser = async (req, res) => {
  try {
    const { email, password, role, profileData } = req.body;

    let existingUser = false;
    let existingPending = false;

    if (role === "STUDENT") {
      const existingUserRecord = await User.findOne({
        $or: [
          { email: email },
          { aparId: profileData.aparId },
          { rollNumber: profileData.rollNumber },
        ],
      });
      if (existingUserRecord) existingUser = true;

      const existingPendingRecord = await PendingUser.findOne({
        $or: [
          { email: email },
          { "profileData.aparId": profileData.aparId },
          { "profileData.rollNumber": profileData.rollNumber },
        ],
      });
      if (existingPendingRecord) existingPending = true;
    } else {
      const existingUserRecord = await User.findOne({ email });
      if (existingUserRecord) existingUser = true;

      const existingPendingRecord = await PendingUser.findOne({ email });
      if (existingPendingRecord) existingPending = true;
    }

    if (existingUser || existingPending) {
      return res.status(400).json({
        message:
          "A user with this email/rollNumber/aparId is already registered or pending for approval.",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPending = new PendingUser({
      email,
      password: hashedPassword,
      role,
      profileData,
    });

    await newPending.save();

    return res.status(200).json({
      message: "Registration request submitted. Awaiting admin approval.",
      success: true,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      let message = `User with this ${duplicateField} already exists`;
      return res.status(400).json({ message, success: false });
    }
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Login Function
 * Valid User can login and will get the essential profile data
 */
const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid Password", success: false });
    }

    return generateTokenAndLogin(user, rememberMe, req, res);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

/**
 * Helper to generate JWT and return response
 */
const generateTokenAndLogin = async (user, rememberMe, req, res) => {
  try {
    const expiresIn = rememberMe ? "7d" : "24h";
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.__v;

    const userWithPhoto = await getUserWithProfilePhoto(user._id);
    if (!userWithPhoto) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Login successful",
      success: true,
      user: userWithPhoto,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * function for uploading user profile picture to database
 */

const uploadImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const photoBase64 = req.file.buffer.toString("base64");

    await ProfilePhoto.updateOne(
      { user: userId },
      {
        $set: {
          image: photoBase64,
        },
      },
      { upsert: true }
    );
    const userWithPhoto = await getUserWithProfilePhoto(userId);
    if (!userWithPhoto) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    return res.status(202).json({
      success: true,
      user: userWithPhoto,
      message: "Image uploaded Successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(503).json({
      message: "we are having some trouble while uploading , try again later",
    });
  }
};

/**
 * function for deleting profile photo
 */

const deleteImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const userWithPhoto = await getUserWithProfilePhoto(userId);
    if (!userWithPhoto) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    await ProfilePhoto.deleteOne({ user: userId });
    return res.status(200).json({
      success: true,
      user: userWithPhoto,
      message: "Image Deleted Successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(503).json({
      message: "we are having some trouble while deleting , try again later",
    });
  }
};

const getUserWithProfilePhoto = async (userId) => {
  const user = await User.findById(userId).select("-password -__v").lean();
  if (!user) return null;

  const profilePhotoDoc = await ProfilePhoto.findOne({ user: userId });
  return {
    ...user,
    profilePictureUrl: profilePhotoDoc ? profilePhotoDoc.image : null,
  };
};

/**function  for getting profile */
const getProfile = async (req, res) => {
  try {
    const user = await getUserWithProfilePhoto(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    res.json({ user, success: true });
  } catch (error) {
    console.log("Something's wrong in getting profile", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
module.exports = {
  registerUser,
  loginUser,
  uploadImage,
  deleteImage,
  getProfile,
};
