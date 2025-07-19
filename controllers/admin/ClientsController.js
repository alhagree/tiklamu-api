const db = require("../../shared/db");

// ✅ جلب كل العملاء
exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM clients");
    res.json(results);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({ error: "حدث خطأ أثناء جلب العملاء" });
  }
};

// ✅ جلب عميل واحد
exports.getById = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM clients WHERE cl_id = ?", [req.params.id]);
    if (results.length === 0) return res.status(404).json({ error: "العميل غير موجود" });
    res.json(results[0]);
  } catch (err) {
    console.error("Error fetching client by ID:", err);
    res.status(500).json({ error: "حدث خطأ أثناء جلب العميل" });
  }
};

// ✅ إضافة عميل جديد مع فحص القيم وطباعة body
exports.add = async (req, res) => {
  const { cl_name, cl_phone, cl_email } = req.body;

  console.log("📥 بيانات العميل المستلمة:", req.body);

  // تحقق من القيم الأساسية
  if (!cl_name || !cl_phone || !cl_email) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة: الاسم، الهاتف، البريد الإلكتروني" });
  }

  try {
    const cl_password = "default123"; // كلمة مرور مؤقتة
    const cl_created_at = new Date(); // التاريخ الحالي
    const cl_is_active = 1; // نشط افتراضياً
    const cl_status = "active"; // أو "active" حسب النظام

    const [result] = await db.query(
      `INSERT INTO clients 
      (cl_name, cl_phone, cl_email, cl_password, cl_created_at, cl_is_active, cl_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cl_name, cl_phone, cl_email, cl_password, cl_created_at, cl_is_active, cl_status]
    );

    res.json({ message: "✅ تمت الإضافة بنجاح", id: result.insertId });
  } catch (err) {
    console.error("❌ خطأ أثناء الإضافة:", err);
    res.status(500).json({ error: "فشل في إضافة العميل" });
  }
};

// ✅ تعديل بيانات عميل
exports.update = async (req, res) => {
  const { cl_name, cl_phone, cl_email } = req.body;

  if (!cl_name || !cl_phone || !cl_email) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة للتعديل" });
  }

  try {
    await db.query(
      "UPDATE clients SET cl_name = ?, cl_phone = ?, cl_email = ? WHERE cl_id = ?",
      [cl_name, cl_phone, cl_email, req.params.id]
    );
    res.json({ message: "✅ تم التعديل بنجاح" });
  } catch (err) {
    console.error("❌ خطأ أثناء التعديل:", err);
    res.status(500).json({ error: "فشل في تعديل العميل" });
  }
};

// ✅ حذف عميل نهائيًا
exports.delete = async (req, res) => {
  try {
    await db.query("DELETE FROM clients WHERE cl_id = ?", [req.params.id]);
    res.json({ message: "🗑️ تم الحذف نهائيًا" });
  } catch (err) {
    console.error("❌ خطأ أثناء الحذف:", err);
    res.status(500).json({ error: "فشل في حذف العميل" });
  }
};

// ✅ تعطيل عميل
exports.disable = async (req, res) => {
  try {
    await db.query("UPDATE clients SET cl_is_active = 0 WHERE cl_id = ?", [req.params.id]);
    res.json({ message: "🚫 تم التعطيل" });
  } catch (err) {
    console.error("❌ خطأ أثناء التعطيل:", err);
    res.status(500).json({ error: "فشل في تعطيل العميل" });
  }
};

// ✅ تفعيل عميل
exports.enable = async (req, res) => {
  try {
    await db.query("UPDATE clients SET cl_is_active = 1 WHERE cl_id = ?", [req.params.id]);
    res.json({ message: "✅ تم التفعيل" });
  } catch (err) {
    console.error("❌ خطأ أثناء التفعيل:", err);
    res.status(500).json({ error: "فشل في تفعيل العميل" });
  }
};
