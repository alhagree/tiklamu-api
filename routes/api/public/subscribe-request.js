const express = require("express");
const router = express.Router();
const db = require("../../../shared/db");

// 📨 استقبال طلب اشتراك جديد
router.post("/", async (req, res) => {
  const { full_name, phone, project_name, notes } = req.body;

  // تحقق من الحقول المطلوبة
  if (!full_name || !phone || !project_name) {
    return res
      .status(400)
      .json({ message: "الرجاء ملء جميع الحقول المطلوبة." });
  }

  try {
    const sql = `
      INSERT INTO subscription_requests (
        sr_full_name,
        sr_phone,
        sr_project_name,
        sr_notes
      ) VALUES (?, ?, ?, ?)
    `;
    const values = [full_name, phone, project_name, notes || null];
    await db.query(sql, values);

    res.status(200).json({ message: "تم حفظ الطلب بنجاح." });
  } catch (err) {
    console.error("خطأ في حفظ الطلب:", err);
    res.status(500).json({ message: "حدث خطأ أثناء معالجة الطلب." });
  }
});

module.exports = router;
