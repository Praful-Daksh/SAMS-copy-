const Subject = require("../Models/Subject.js");
const { User } = require("../Models/User.js");
const AssignedSubject = require("../Models/AssignedSubjects.js");
const departmentAssignment = require("../Models/AssignedDepartments.js");
const Curriculum = require("../Models/Curriculum.js");

/**
 * Get all subjects by department, year, semester
 * (optional: curriculum filter can be added later)
 */
const getSubjectsbyCriteria = async (req, res) => {
  try {
    let { department, year, semester } = req.query;

    const query = {};
    if (semester) query.semester = semester;
    if (department) query.department = department;
    if (year) query.year = year;

    if (req.user.role === "HOD") {
      const assignedDetails = await departmentAssignment
        .findOne({ hod: req.user.id })
        .lean();

      if (!assignedDetails) {
        return res.status(403).json({
          success: false,
          message: "Access denied for unassigned department",
        });
      }

      const assignedDepartment = assignedDetails.department;
      const assignedYears = assignedDetails.departmentYears;
      year = Number(year);

      if (year && !assignedYears.includes(year)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized year access",
        });
      }

      if (!department) department = assignedDepartment;
    }

    const subjects = await Subject.find(query).select("-__v");
    if (subjects.length === 0) {
      return res.status(200).json({
        message: "No subjects found matching the criteria",
        subjects: [],
        success: true,
      });
    }

    return res.status(200).json({
      message: "Subjects fetched successfully",
      subjects,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/**
 * Add a new subject and link to curriculum
 */
const addSubject = async (req, res) => {
  const { name, code, department, year, semester, curriculumId } = req.body;

  if (!curriculumId) {
    return res.status(400).json({
      message: "Curriculum is required",
      success: false,
    });
  }

  try {
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({
        message: "Subject with same code already exists",
        success: false,
      });
    }

    const newSubject = new Subject({
      name,
      code,
      department,
      year,
      semester,
    });

    await newSubject.save();

    // Add subject to curriculum
    const updatedCurriculum = await Curriculum.findByIdAndUpdate(
      curriculumId,
      { $addToSet: { subjects: newSubject._id } },
      { new: true }
    );

    if (!updatedCurriculum) {
      return res.status(404).json({
        message: "Curriculum not found",
        success: false,
      });
    }

    return res.status(201).json({
      message: "Subject added successfully",
      subject: newSubject,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/**
 * Assign a subject to a faculty
 */
const assignSubject = async (req, res) => {
  const assignedBy = req.user.id;
  const { subjectId, facultyId, section } = req.body;

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
        success: false,
      });
    }

    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found",
        success: false,
      });
    }

    const existingAssignment = await AssignedSubject.findOne({
      subject: subjectId,
      section,
    });

    if (existingAssignment) {
      return res.status(400).json({
        message: "This subject is already assigned to a faculty",
        success: false,
      });
    }

    const newAssignment = new AssignedSubject({
      subject: subjectId,
      faculty: facultyId,
      section,
      assignedBy,
    });

    await newAssignment.save();

    return res.status(201).json({
      message: "Subject assigned successfully",
      assignment: {
        subject: subject.name,
        faculty: `${faculty.firstName} ${faculty.lastName}`,
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/**
 * Delete subject assignment by ID
 */
const deleteSubjectAssignment = async (req, res) => {
  const assignmentId = req.query.assignmentId;

  try {
    const assignment = await AssignedSubject.findByIdAndDelete(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (err) {
    console.error("Assignment Deletion Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getSubjectsbyCriteria,
  addSubject,
  assignSubject,
  deleteSubjectAssignment,
};
