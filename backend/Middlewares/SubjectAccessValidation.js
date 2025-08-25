const { User } = require("../Models/User.js");
const Subject = require("../Models/Subject.js");
const departmentAssignment = require("../Models/AssignedDepartments.js");
const AssignedSubject = require("../Models/AssignedSubjects.js");
const Class = require("../Models/Class.js");

const checkAccess = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select("-password -__v").lean();
    if (!user) {
      return res.status(404).json({
        message: "Account doesn't exist.",
        success: false,
      });
    }
    if (user.role === "ADMIN") {
      return next();
    }

    const assignedDepartmentsAndYear = await departmentAssignment
      .findOne({ hod: userId })
      .select("-__v")
      .lean();
    if (!assignedDepartmentsAndYear) {
      return res.status(404).json({
        message: "No Department and year is assigned to you",
        success: false,
      });
    }

    const { department, departmentYears } = assignedDepartmentsAndYear;
    let year, reqDepartment, semester;

    if (req.body.department && req.body.year) {
      reqDepartment = req.body.department;
      year = req.body.year;
      semester = req.body.semester;
    } else if (req.body.subjectId) {
      const subject = await Subject.findOne({ _id: req.body.subjectId });
      if (!subject) {
        return res.status(404).json({
          message: "Subject not found",
          success: false,
        });
      }
      reqDepartment = subject.department;
    } else if (req.params.assignmentId) {
      const assignment = await AssignedSubject.findById(
        req.params.assignmentId
      ).lean();
      if (!assignment) {
        return res.status(404).json({
          message: "Assignment not found",
          success: false,
        });
      }
      const subject = await Subject.findById(assignment.subject).lean();
      if (!subject) {
        return res.status(404).json({
          message: "Subject not found for assignment",
          success: false,
        });
      }
      reqDepartment = subject.department;
    } else if (req.body.classId) {
      const classDoc = await Class.findById(req.body.classId).lean();
      if (!classDoc) {
        return res.status(404).json({
          message: "Class not found",
          success: false,
        });
      }
      reqDepartment = classDoc.department;
      year = classDoc.year;
      semester = classDoc.semester;
    } else {
      return res.status(400).json({
        message: "Insufficient data to validate access.",
        success: false,
      });
    }

    if (reqDepartment !== department) {
      return res.status(403).json({
        message: "You are not authorized to make changes in this department",
        success: false,
      });
    }

    if (year && !departmentYears.includes(parseInt(year))) {
      return res.status(403).json({
        message:
          "You are not authorized to make changes in this department/year",
        success: false,
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message:
        "Internal Server Error occurred while validating subject access.",
      success: false,
    });
  }
};

module.exports = checkAccess;
