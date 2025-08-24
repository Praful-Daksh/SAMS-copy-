const express = require("express");
const AdminRouter = express.Router();
const ensureAuthenticated = require("../Middlewares/Authentication.js");
const {
  approveUser,
  rejectUser,
} = require("../Controllers/AdminController.js");

AdminRouter.post("/approve", ensureAuthenticated(["ADMIN"]), approveUser);

AdminRouter.delete(
  "/reject/:pendingUserId",
  ensureAuthenticated(["ADMIN"]),
  rejectUser
);

module.exports = AdminRouter;
