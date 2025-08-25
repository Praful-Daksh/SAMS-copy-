const express = require("express");
const SubjectRouter = express.Router();
const ensureAuthenticated = require("../Middlewares/Authentication");
const {
  getSubjectsbyCriteria,
  addSubject,
  assignSubject,
  deleteSubjectAssignment,
  getCurriculum,
} = require("../Controllers/SubjectController");
const {
  getSubjectsValidation,
  addSubjectValidation,
  assignSubjectValidation,
} = require("../Middlewares/SubjectValidation");
const checkAccess = require("../Middlewares/SubjectAccessValidation");

SubjectRouter.get("/", (req, res) => {
  res.send("It is the Subject Router!");
});

SubjectRouter.get("/by-criteria", ensureAuthenticated([]), getSubjectsbyCriteria);

SubjectRouter.get("/curriculum", ensureAuthenticated(["HOD", "ADMIN", "FACULTY"]), getCurriculum);

SubjectRouter.post(
  "/add",
  ensureAuthenticated(["HOD", "ADMIN"]),
  addSubjectValidation,
  checkAccess,
  addSubject
);

SubjectRouter.post(
  "/assign",
  ensureAuthenticated(["HOD", "ADMIN"]),
  assignSubjectValidation,
  checkAccess,
  assignSubject
);

SubjectRouter.delete(
  "/assignment/:assignmentId",
  ensureAuthenticated(["HOD", "ADMIN"]),
  deleteSubjectAssignment
);

module.exports = SubjectRouter;
