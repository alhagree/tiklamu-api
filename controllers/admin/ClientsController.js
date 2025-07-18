const db = require("../../shared/db");

// جلب كل العملاء
exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM clients");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// جلب عميل واحد
exports.getById = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM clients WHERE cl_id = ?", [req.params.id]);
    if (results.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// إضافة عميل
exports.add = async (req, res) => {
  const { cl_name, cl_phone, cl_email } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO clients (cl_name, cl_phone, cl_email) VALUES (?, ?, ?)",
      [cl_name, cl_phone, cl_email]
    );
    res.json({ message: "تمت الإضافة بنجاح", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// تعديل عميل
exports.update = async (req, res) => {
  const { cl_name, cl_phone, cl_email } = req.body;
  try {
    await db.query(
      "UPDATE clients SET cl_name = ?, cl_phone = ?, cl_email = ? WHERE cl_id = ?",
      [cl_name, cl_phone, cl_email, req.params.id]
    );
    res.json({ message: "تم التعديل بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// حذف عميل نهائي
exports.delete = async (req, res) => {
  try {
    await db.query("DELETE FROM clients WHERE cl_id = ?", [req.params.id]);
    res.json({ message: "تم الحذف نهائيًا" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// تعطيل عميل
exports.disable = async (req, res) => {
  try {
    await db.query("UPDATE clients SET cl_is_active = 0 WHERE cl_id = ?", [req.params.id]);
    res.json({ message: "تم التعطيل" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// تفعيل عميل
exports.enable = async (req, res) => {
  try {
    await db.query("UPDATE clients SET cl_is_active = 1 WHERE cl_id = ?", [req.params.id]);
    res.json({ message: "✅ تم التفعيل" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};