const {
  User,
  Student,
  Faculty,
  HOD,
  ClassTeacher,
  Admin,
  Guest,
} = require("../Models/User.js");
const PendingUser = require("../Models/PendingUsers.js");
const Class = require("../Models/Class.js");
const Curriculum = require("../Models/Curriculum.js");

/**
 * function for approve request of user for registration
 */
const approveUser = async (req, res) => {
  try {
    const updatedUser = req.body;
    const pending = await PendingUser.findById(updatedUser._id);
    if (!pending) {
      return res
        .status(404)
        .json({ message: "Pending user not found", success: false });
    }

    const roleModels = {
      STUDENT: Student,
      FACULTY: Faculty,
      ADMIN: Admin,
      HOD: HOD,
      CLASS_TEACHER: ClassTeacher,
      GUEST: Guest,
    };

    const Model = roleModels[pending.role];
    if (!Model) {
      return res
        .status(400)
        .json({ message: "Invalid role in pending data", success: false });
    }

    const profileData = { ...pending.profileData };
    let classDoc = null;

    if (pending.role === "STUDENT") {
      const { department, year, section, admission_academic_year, lateralEntry } =
        profileData;
      
      // Calculate batch based on admission year
      const admissionYear = new Date(admission_academic_year).getFullYear();
      const batch = lateralEntry ? (admissionYear - 1).toString() : admissionYear.toString();

      // Find the class for this student
      classDoc = await Class.findOne({ 
        department, 
        year, 
        section, 
        batch,
        semester: profileData.semester 
      });
      
      if (!classDoc) {
        return res.status(404).json({
          message: "No class found for the student's department/year/section/batch/semester",
          success: false,
        });
      }

      // Update profile data with batch and class reference
      profileData.batch = batch;
      profileData.admission_academic_year = new Date(admission_academic_year);
    }

    const newUser = new Model({
      email: pending.email,
      password: pending.password,
      role: pending.role,
      ...profileData,
    });

    await newUser.save();

    if (classDoc) {
      classDoc.students.push(newUser._id);
      await classDoc.save();
    }

    await PendingUser.findByIdAndDelete(updatedUser._id);

    res.status(200).json({
      message: "User approved and created",
      success: true,
      userId: newUser._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * function for rejecting user
 * stopping user to be registered
 */
const rejectUser = async (req, res) => {
  const { pendingUserId } = req.params;
  try {
    await PendingUser.findByIdAndDelete(pendingUserId);
    return res
      .status(200)
      .json({ message: "User registration request rejected", success: true });
  } catch (err) {
    console.log("user rejecting error : ", err);
    return res.status(500).json({
      message: "Something's wrong at out end",
    });
  }
};


module.exports = {
  approveUser,
  rejectUser,
};
