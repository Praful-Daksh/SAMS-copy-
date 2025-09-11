const Subject = require("../Models/Subject.js");
const { User } = require("../Models/User.js");
const AssignedSubject = require("../Models/AssignedSubjects.js");
const departmentAssignment = require("../Models/AssignedDepartments.js");
const Curriculum = require("../Models/Curriculum.js");
const Class = require("../Models/Class.js");
const DepartmentAssignment = require("../Models/AssignedDepartments.js");

/**
 * Get all subjects by department, year, semester
 * Now fetches subjects from curriculum based on class
 */
const getSubjectsbyCriteria = async (req, res) => {
  try {
    let { department, year, semester, batch, section } = req.query;

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

    // Find the class to get the curriculum
    const classQuery = {};
    if (department) classQuery.department = department;
    if (year) classQuery.year = year;
    if (semester) classQuery.semester = semester;
    if (batch) classQuery.batch = batch;
    if (section) classQuery.section = section;

    const classDoc = await Class.findOne(classQuery).populate({
      path: "curriculum",
      populate: {
        path: "subjectsBySemester",
        model: "Subject",
      },
    });

    if (!classDoc || !classDoc.curriculum) {
      return res.status(200).json({
        message: "No subjects found for the given criteria",
        subjects: [],
        success: true,
      });
    }

    // Get subjects for the specific semester from curriculum
    const semesterKey = semester ? semester.toString() : "1";
    const subjects =
      classDoc.curriculum.subjectsBySemester.get(semesterKey) || [];

    if (subjects.length === 0) {
      return res.status(200).json({
        message: "No subjects found for the specified semester",
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
 * Add a new subject to curriculum
 * This adds the subject to the curriculum for the department
 */
const addSubject = async (req, res) => {
  const { name, code, department, semester } = req.body;

  try {
    // Check if subject with same code already exists
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
    });

    await newSubject.save();

    // Find or create curriculum for the department
    let curriculum = await Curriculum.findOne({ department });

    if (!curriculum) {
      curriculum = new Curriculum({
        department,
        subjectsBySemester: new Map(),
      });
    }

    const semesterKey = semester ? semester.toString() : "1";
    if (!curriculum.subjectsBySemester.has(semesterKey)) {
      curriculum.subjectsBySemester.set(semesterKey, []);
    }

    const semesterSubjects = curriculum.subjectsBySemester.get(semesterKey);
    semesterSubjects.push(newSubject._id);
    curriculum.subjectsBySemester.set(semesterKey, semesterSubjects);

    await curriculum.save();

    return res.status(201).json({
      message: "Subject added successfully to curriculum",
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
  const { subjectId, facultyId, section, department, year, semester, batch } =
    req.body;

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

    // Find the class for this assignment
    const classDoc = await Class.findOne({
      department,
      year,
      semester,
      batch,
      section,
    });

    if (!classDoc) {
      return res.status(404).json({
        message: "Class not found for the given criteria",
        success: false,
      });
    }

    const existingAssignment = await AssignedSubject.findOne({
      subject: subjectId,
      class: classDoc._id,
      section,
    });

    if (existingAssignment) {
      return res.status(400).json({
        message:
          "This subject is already assigned to a faculty for this class and section",
        success: false,
      });
    }

    const newAssignment = new AssignedSubject({
      subject: subjectId,
      faculty: facultyId,
      class: classDoc._id,
      section,
      assignedBy,
    });

    await newAssignment.save();

    return res.status(201).json({
      message: "Subject assigned successfully",
      assignment: {
        subject: subject.name,
        faculty: `${faculty.firstName} ${faculty.lastName}`,
        class: `${department} ${year}${semester} ${batch} ${section}`,
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

/**
 * Get curriculum for a department
 */
const getCurriculum = async (req, res) => {
  const { department } = req.query;

  try {
    const curriculum = await Curriculum.findOne({ department }).populate({
      path: "subjectsBySemester",
      model: "Subject",
    });

    if (!curriculum) {
      return res.status(404).json({
        message: "Curriculum not found for the department",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Curriculum fetched successfully",
      curriculum,
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

const getSubjects = async (req, res) => {
  try {
    const hodAssignment = await DepartmentAssignment.findOne({
      hod: req.user.id,
    }).lean();
    if (!hodAssignment) {
      return res.status(404).json({
        message: "account not found",
        success: false,
      });
    }
    const { year } = req.query;
    if (!year) {
      return res
        .status(400)
        .json({ message: "Missing required query parameters." });
    }

    const department = hodAssignment.department;
    const semesterToGet = [`${2 * year - 1}`, `${2 * year}`];

    const subjects = await Curriculum.aggregate([
      {
        $match: {
          department: department,
        },
      },
      {
        $project: {
          _id: 0,
          allSubjectIds: {
            $reduce: {
              input: semesterToGet,
              initialValue: [],
              in: {
                $concatArrays: [
                  "$$value",
                  {
                    $map: {
                      input: {
                        $ifNull: [
                          {
                            $getField: {
                              field: "$$this",
                              input: "$subjectsBySemester",
                            },
                          },
                          [],
                        ],
                      },
                      as: "subjectId",
                      in: {
                        subjectId: "$$subjectId",
                        semester: "$$this",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: "$allSubjectIds",
      },
      {
        $lookup: {
          from: "subjects",
          localField: "allSubjectIds.subjectId",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $unwind: "$subject",
      },
      {
        $addFields: {
          "subject.semester": "$allSubjectIds.semester",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$subject",
        },
      },
    ]);
    return res.status(200).json({ subjects });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch subjects.", error: error.message });
  }
};

const getSubjectAssignmentsByHOD = async (req, res) => {
  try {
    const hodId = req.user.id;
    const assignments = await AssignedSubject.find({ hod: hodId });
    return res.status(200).json({ assignments });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch subject assignments.",
      error: error.message,
    });
  }
};

module.exports = {
  getSubjectsbyCriteria,
  addSubject,
  assignSubject,
  deleteSubjectAssignment,
  getCurriculum,
  getSubjects,
  getSubjectAssignmentsByHOD,
};
