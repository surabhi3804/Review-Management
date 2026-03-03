const express = require("express");
const router = express.Router();
const { getRootCause, compareBranches } = require("../controllers/rootCauseController");

// GET /api/root-cause/:branchId
// Query params: ?startDate=2024-01-01&endDate=2024-12-31
router.get("/:branchId", getRootCause);

// GET /api/root-cause/compare/all
router.get("/compare/all", compareBranches);

module.exports = router;