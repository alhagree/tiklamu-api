const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  res.send("Public login endpoint (placeholder)");
});

module.exports = router;