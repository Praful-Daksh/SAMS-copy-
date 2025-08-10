const mongoose = require("mongoose");
const Attendance = require("../Models/Attendance.js");
const ClassInfo = require("../Models/Class.js");
const AssignedSubject = require("../Models/AssignedSubjects.js");
const Subject = require("../Models/Subject.js");

/**
 * Get a student's attendance for a specific subject using aggregation
 */
const getAttendancebySubject = async (req, res) => {
  const { studentId, subjectId } = req.query;

  if (
    !studentId ||
    !subjectId ||
    !mongoose.Types.ObjectId.isValid(studentId) ||
    !mongoose.Types.ObjectId.isValid(subjectId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid studentId or subjectId",
    });
  }

  try {
    const result = await Attendance.aggregate([
      { $match: { subject: new mongoose.Types.ObjectId(subjectId) } },
      { $unwind: "$students" },
      {
        $match: {
          "students.studentId": new mongoose.Types.ObjectId(studentId),
        },
      },
      {
        $group: {
          _id: null,
          totalClasses: { $sum: 1 },
          totalAttended: {
            $sum: {
              $cond: [{ $eq: ["$students.status", "Present"] }, 1, 0],
            },
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No attendance records found for this subject",
        totalClasses: 0,
        totalAttended: 0,
      });
    }

    const { totalClasses, totalAttended } = result[0];

    return res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      totalClasses,
      totalAttended,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * Mark attendance for a subject and class
 */
const markAttendance = async (req, res) => {
  const facultyId = req.user.id;
  const { classId, subjectId, studentsAttendance } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(classId) ||
    !mongoose.Types.ObjectId.isValid(subjectId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid classId or subjectId",
    });
  }

  try {
    const subjectInfo = await Subject.findById(subjectId).lean();
    if (!subjectInfo) {
      return res.status(404).json({
        message: "Invalid Subject",
        success: false,
      });
    }

    const classDoc = await ClassInfo.findById(classId).lean();
    if (!classDoc) {
      return res.status(404).json({
        message: "Invalid Class",
        success: false,
      });
    }

    const facultyAssignment = await AssignedSubject.findOne({
      faculty: facultyId,
      subject: subjectId,
      section: classDoc.section,
    }).lean();

    if (!facultyAssignment) {
      return res.status(403).json({
        message: "You are not assigned to this subject or section.",
        success: false,
      });
    }

    if (
      !studentsAttendance ||
      !studentsAttendance.date ||
      !Array.isArray(studentsAttendance.students) ||
      studentsAttendance.students.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid attendance data",
        success: false,
      });
    }

    const date = new Date(studentsAttendance.date);
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));

    const existingAttendance = await Attendance.findOne({
      subject: subjectId,
      class: classId,
      date: { $gte: start, $lte: end },
    });

    if (existingAttendance) {
      return res.status(409).json({
        message: "Attendance already marked for this subject and date",
        success: false,
      });
    }

    const attendance = new Attendance({
      subject: subjectId,
      class: classId,
      date: studentsAttendance.date,
      students: studentsAttendance.students.map((student) => ({
        studentId: student.studentId,
        status: student.status,
      })),
    });

    await attendance.save();

    return res.status(201).json({
      message: "Attendance marked successfully",
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error while marking attendance",
      success: false,
    });
  }
};

/**
 * Get attendance for a subject and class on a specific date
 */
const getAttendanceByDate = async (req, res) => {
  const { classId, subjectId, date } = req.query;

  if (
    !classId ||
    !subjectId ||
    !date ||
    !mongoose.Types.ObjectId.isValid(subjectId) ||
    !mongoose.Types.ObjectId.isValid(classId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid classId, subjectId, or date",
    });
  }

  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      subject: subjectId,
      class: classId,
      date: { $gte: start, $lte: end },
    })
      .populate({
        path: "students.studentId",
        select: "firstName lastName rollNumber",
      })
      .lean();

    if (!attendance) {
      return res.status(200).json({
        success: false,
        message: "No attendance record found for the subject on this date",
      });
    }

    const attendanceData = {
      date: attendance.date,
      students: attendance.students.map((student) => ({
        studentId: student.studentId?._id,
        name: `${student.studentId?.firstName || ""} ${
          student.studentId?.lastName || ""
        }`.trim(),
        rollNumber: student.studentId?.rollNumber,
        status: student.status,
      })),
    };

    return res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      attendance: attendanceData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getAttendancebySubject,
  markAttendance,
  getAttendanceByDate,
};
