const express = require("express");
const router = express.Router();
const db = require("../../../shared/db");

// ✅ جلب سجل الزوار
router.get("/visits", (req, res) => {
  const query = `
    SELECT v.vs_id, u.us_link_code, c.cl_name AS client_name, v.vs_ip_address, v.vs_user_agent, v.vs_visit_time
    FROM visits v
    JOIN us_users u ON v.vs_us_link_code = u.us_link_code
    JOIN clients c ON u.us_client_id = c.cl_id
    ORDER BY v.vs_visit_time DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
});

router.post("/visit", (req, res) => {
  const { us_link_code, user_agent } = req.body;
  const ip_address = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const query = `
    INSERT INTO visits (vs_us_link_code, vs_ip_address, vs_user_agent)
    VALUES (?, ?, ?)
  `;
  db.run(query, [us_link_code, ip_address, user_agent], (err) => {
    if (err) return res.status(500).json({ error: "Insert failed" });
    res.json({ success: true });
  });
});


module.exports = router;
