const { default: mongoose } = require("mongoose");
const classInfo = require("../Models/Class");
const { User } = require("../Models/User.js");
const Curriculum = require("../Models/Curriculum.js");
const AssignedSubject = require("../Models/AssignedSubjects.js");

/**
 * function for getting class details for a specific batch , department and year
 * it returns class details along with curriculum subjects and students for this class.
 */
const getClassDetails = async (req, res) => {
  const { batch, department, section, year, semester } = req.query;

  try {
    const classQuery = {};
    if (batch) classQuery.batch = batch;
    if (department) classQuery.department = department;
    if (section) classQuery.section = section;
    if (year) classQuery.year = year;
    if (semester) classQuery.semester = semester;

    const classDetails = await classInfo
      .findOne(classQuery)
      .select("-__v")
      .populate({
        path: "curriculum",
        populate: {
          path: "subjectsBySemester",
          model: "Subject"
        }
      })
      .populate({
        path: "students",
        select: "firstName lastName email aparId",
      });

    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: "No details found for given criteria",
      });
    }

    // Get subject assignments for this class
    const subjectAssignments = await AssignedSubject.find({
      class: classDetails._id
    }).populate({
      path: "subject",
      select: "name code"
    }).populate({
      path: "faculty",
      select: "firstName lastName email"
    });

    return res.status(200).json({
      success: true,
      message: "Class Details fetched successfully",
      classDetails: {
        ...classDetails.toObject(),
        subjectAssignments
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Occurred while fetching classDetails",
    });
  }
};

/**
 * function for creating new class only can be created by Admin or HOD
 * it checks if database have no existing class with same batch , department and section
 * returns a new created class for the details entered
 */
const newClass = async (req, res) => {
  const { department, year, batch, section, semester } = req.body;
  try {
    const existingClass = await classInfo.findOne({
      batch: batch,
      department: department,
      section: section,
      year: year,
      semester: semester,
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: "Class with same details already exists",
      });
    }

    // Find or create curriculum for the department
    let curriculum = await Curriculum.findOne({ department });
    if (!curriculum) {
      curriculum = new Curriculum({
        department,
        subjectsBySemester: new Map()
      });
      await curriculum.save();
    }

    const newClass = new classInfo({
      department: department,
      batch: batch,
      year: year,
      section: section,
      semester: semester,
      curriculum: curriculum._id,
    });

    await newClass.save();

    return res.status(201).json({
      success: true,
      message: "New class created successfully",
      classDetails: {
        department: department,
        batch: batch,
        year: year,
        section: section,
        semester: semester,
        curriculum: curriculum._id,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Occurred while adding Class",
    });
  }
};

/**
 * Get all classes for a department
 */
const getClassesByDepartment = async (req, res) => {
  const { department } = req.query;

  try {
    const classes = await classInfo
      .find({ department })
      .select("-__v")
      .populate({
        path: "curriculum",
        select: "version"
      })
      .populate({
        path: "students",
        select: "firstName lastName",
      });

    return res.status(200).json({
      success: true,
      message: "Classes fetched successfully",
      classes,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching classes",
    });
  }
};

/**
 * Get subjects for a specific class semester
 */
const getClassSubjects = async (req, res) => {
  const { classId } = req.params;

  try {
    const classDoc = await classInfo.findById(classId).populate({
      path: "curriculum",
      populate: {
        path: "subjectsBySemester",
        model: "Subject"
      }
    });

    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const semesterKey = classDoc.semester.toString();
    const subjects = classDoc.curriculum.subjectsBySemester.get(semesterKey) || [];

    return res.status(200).json({
      success: true,
      message: "Subjects fetched successfully",
      subjects,
      semester: classDoc.semester,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching subjects",
    });
  }
};

module.exports = {
  getClassDetails,
  newClass,
  getClassesByDepartment,
  getClassSubjects,
};
