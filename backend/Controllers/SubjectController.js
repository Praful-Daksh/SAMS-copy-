const Subject = require("../Models/Subject.js");
const { User } = require("../Models/User.js");
const AssignedSubject = require("../Models/AssignedSubjects.js");
const Class = require("../Models/Class.js");
const departmentAssignment = require("../Models/AssignedDepartments.js");

/**
 * function to find all subjects for the given department , year, semester
 * returns subject info (subjectName, subjectCode etc.)
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
          message: "You are not allowed to request above your access.",
        });
      }
      const assignedDepartment = assignedDetails.department;
      const assignedYears = assignedDetails.departmentYears;
      year = Number(year);
      if (year && !assignedYears.includes(year)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized 'year' access.",
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
    res.status(200).json({
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
 * function for adding new Subject
 * gets subject name , code other essential things
 * fetch for existing subject with same details (if)
 * returns a newly created subject
 */
const addSubject = async (req, res) => {
  const { name, code, department, year, semester, batch } = req.body;
  try {
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({
        message: "Subject with the same code already exists",
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
    await Class.updateMany(
      { department, year, batch },
      {
        $addToSet: { subjects: { subject: newSubject._id } },
      }
    );

    res.status(201).json({
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
 * function for assigning a subject to a faculty
 * it gets subject Id , facultyId (NOTE- mongoose Id), section.
 * it checks that faculty id and student id is available in database 
    and then check for existing assignment of subject and the faculty 
 *  returns the newly assigned subjectName and facultyName
 */
const assignSubject = async (req, res) => {
  const { subjectId, facultyId, section } = req.body;
  try {
    const subject = await Subject.findOne({ _id: subjectId });
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
        success: false,
      });
    }
    const faculty = await User.findOne({ _id: facultyId });
    if (!faculty) {
      return res.status(404).json({
        message: "Teacher not found",
        success: false,
      });
    }
    const existingAssignment = await AssignedSubject.findOne({
      subject: subject._id,
      section: section,
    });
    if (existingAssignment) {
      return res.status(400).json({
        message: "This subject is already assigned to the faculty",
        success: false,
      });
    }
    const newAssignment = new AssignedSubject({
      subject: subject._id,
      faculty: faculty._id,
      section: section,
    });

    await newAssignment.save();
    res.status(201).json({
      message: "Subject assigned successfully",
      assignment: {
        subject: subject.name,
        faculty: faculty.firstName + " " + faculty.lastName,
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
 * function for deleting subject assignment
 * delete a subject assignment if exists
 */

const deleteSubjectAssignment = async (req, res) => {
  const assignmentId = req.query.assignmentId;
  try {
    const assignment = await AssignedSubject.findByIdAndDelete(assignmentId);
    if (assignment) {
      return res.status(200).json({
        success: true,
        message: "Assignment Deleted",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Assignment Not Found",
      });
    }
  } catch (err) {
    console.log("Assignment Deletion error", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server occurred",
    });
  }
};
module.exports = {
  getSubjectsbyCriteria,
  addSubject,
  assignSubject,
  deleteSubjectAssignment
};
