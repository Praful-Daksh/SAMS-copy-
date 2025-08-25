const express = require("express");
const ensureAuthenticated = require("../Middlewares/Authentication");
const { 
  getClassDetails, 
  newClass, 
  getClassesByDepartment, 
  getClassSubjects 
} = require("../Controllers/ClassController");
const {
  getClassValidation,
  newClassValidation,
} = require("../Middlewares/ClassRequestValidation");
const ClassRouter = express.Router();

ClassRouter.get(
  "/details",
  ensureAuthenticated(["ADMIN", "HOD", "FACULTY", "STUDENT"]),
  getClassValidation,
  getClassDetails
);

ClassRouter.get(
  "/by-department",
  ensureAuthenticated(["ADMIN", "HOD", "FACULTY"]),
  getClassesByDepartment
);

ClassRouter.get(
  "/:classId/subjects",
  ensureAuthenticated(["ADMIN", "HOD", "FACULTY", "STUDENT"]),
  getClassSubjects
);

ClassRouter.post(
  "/new",
  ensureAuthenticated(["ADMIN", "HOD"]),
  newClassValidation,
  newClass
);

// ClassRouter.post(
//   "/createBulkClasses",
//   ensureAuthenticated(["ADMIN"]),
//   bulkCreateClasses
// );

// ClassRouter.post("/newStudentToClass", addStudent);

module.exports = ClassRouter;
