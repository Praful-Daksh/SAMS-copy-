const express = require("express");
const AdminRouter = express.Router();
const { ensureAuthenticated } = require("../Middlewares/Authentication.js");
const {
  approveUser,
  rejectUser,
} = require("../Controllers/AdminController.js");

AdminRouter.post("/approve/:pendingUserId", approveUser);

module.exports = AdminRouter;
