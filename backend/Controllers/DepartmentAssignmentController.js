const departmentAssignment = require("../Models/AssignedDepartments.js");
const classInfo = require("../Models/Class.js");
const { User, HOD } = require("../Models/User.js");

const newAssignment = async (req, res) => {
  const { hodId, department, years } = req.body;

  try {
    const hod = await User.findById(hodId).select("-__v -password").lean();
    if (!hod) {
      return res.status(404).json({
        message: "HOD doesn't exist",
        success: false,
      });
    }

    const doExist = await classInfo
      .find({ department, year: { $in: years } })
      .select("year")
      .lean();

    if (doExist.length === 0) {
      return res.status(404).json({
        message: "Requested department and years do not exist.",
        success: false,
      });
    }

    const isHodAlreadyAssigned = await departmentAssignment.findOne({ hod: hodId });
    if (isHodAlreadyAssigned) {
      return res.status(409).json({
        success: false,
        message: "HOD is already assigned to a department",
      });
    }

    const existingAssignments = await departmentAssignment.find({ department }).lean();

    const alreadyAssignedYears = new Set();
    existingAssignments.forEach((assignment) => {
      assignment.departmentYears.forEach((y) => alreadyAssignedYears.add(y));
    });

    const newYears = years.filter((year) => !alreadyAssignedYears.has(year));

    if (newYears.length === 0) {
      return res.status(400).json({
        message: "All requested years are already assigned.",
        success: false,
      });
    }

    const assignment = new departmentAssignment({
      hod: hodId,
      department,
      departmentYears: newYears,
    });

    await assignment.save();

    return res.status(201).json({
      message: `Department assigned successfully for years: ${newYears.join(", ")}`,
      success: true,
    });
  } catch (err) {
    console.error("Error assigning department:", err);
    return res.status(500).json({
      message: "Internal server error while assigning department.",
      success: false,
    });
  }
};

const getAllHODs = async (req, res) => {
  try {
    const hods = await HOD.find().select("-__v -password").lean();
    return res.status(200).json({
      message: "HODs fetched successfully",
      success: true,
      hods,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error while fetching HODs",
      success: false,
    });
  }
};

const getDepartmentAssignments = async (req, res) => {
  try {
    const assignments = await departmentAssignment.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "hod",
          foreignField: "_id",
          as: "hodInfo",
        },
      },
      {
        $unwind: {
          path: "$hodInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          years: "$departmentYears",
          department: 1,
          hodName: { $concat: ["$hodInfo.firstName", " ", "$hodInfo.lastName"] },
          assignedDate: "$createdAt",
          hodEmail: "$hodInfo.email",
        },
      },
    ]);

    return res.status(200).json({
      message: "Department assignments fetched successfully",
      success: true,
      assignments,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error while fetching department assignments",
      success: false,
    });
  }
};

const getAssignmentsByHOD = async (req, res) => {
  const { hodId } = req.params;
  try {
    const assignments = await departmentAssignment
      .find({ hod: hodId })
      .populate("hod", "firstName lastName email")
      .lean();

    return res.status(200).json({
      message: "HOD assignments fetched successfully",
      success: true,
      assignments,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error while fetching HOD assignments",
      success: false,
    });
  }
};

const removeAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  try {
    const assignment = await departmentAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
        success: false,
      });
    }

    await departmentAssignment.findByIdAndDelete(assignmentId);
    return res.status(200).json({
      message: "Department assignment removed successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error while removing assignment",
      success: false,
    });
  }
};

const updateAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const { department, year } = req.body;

  try {
    const assignment = await departmentAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
        success: false,
      });
    }

    const classExists = await classInfo.findOne({ department, year }).lean();

    if (!classExists) {
      return res.status(404).json({
        message: "Requested class (department, year) does not exist",
        success: false,
      });
    }

    if (assignment.department === department && assignment.departmentYears.includes(year)) {
      return res.status(400).json({
        message: "This year is already assigned in this assignment",
        success: false,
      });
    }

    // Check if another assignment already has this year under the same department
    const duplicate = await departmentAssignment.findOne({
      _id: { $ne: assignmentId },
      department,
      departmentYears: year,
    });

    if (duplicate) {
      return res.status(400).json({
        message: "A different assignment already exists for this department and year",
        success: false,
      });
    }
    
    assignment.department = department;
    assignment.departmentYears.push(year);
    await assignment.save();

    return res.status(200).json({
      message: "Department assignment updated successfully",
      success: true,
    });
  } catch (err) {
    console.error("Error updating assignment:", err);
    return res.status(500).json({
      message: "Internal Server Error while updating assignment",
      success: false,
    });
  }
};

module.exports = {
  newAssignment,
  getAllHODs,
  getDepartmentAssignments,
  getAssignmentsByHOD,
  removeAssignment,
  updateAssignment,
};
