// backend/controllers/admin/SubscribeRequestsController.js
const db = require("../../shared/db");

exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query("SELECT 1 + 1 AS result");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};

// جلب جميع الطلبات
/*
exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM subscribe_requests ORDER BY sr_created_at DESC"
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
/************************************* */

// تحديث الحالة
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query(
      "UPDATE subscribe_requests SET sr_status = ? WHERE sr_id = ?",
      [status, req.params.id]
    );
    res.json({ message: "تم التحديث بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
