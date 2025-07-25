const db = require("../../shared/db");
const imagekit = require("../../utils/imagekit");
const path = require("path");

// ✅ إضافة قسم
exports.addSection = async (req, res) => {
  const client_id = req.user.id;
  const link_code = req.user?.link_code;
  const { name, description, is_active } = req.body;

  if (!name || !client_id) {
    return res.status(400).json({ error: "الاسم ومعرّف العميل مطلوبان" });
  }

  let image = null;

  try {
    if (req.file) {
      const uploadResult = await imagekit.upload({
        file: req.file.buffer,
        fileName: Date.now() + path.extname(req.file.originalname),
        folder: `/menu_project/sections/${link_code}`
      });
      image = uploadResult.url;
    }

    const [result] = await db.query(
      `INSERT INTO sections (se_name, se_description, se_image, se_is_active, se_client_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || "", image, is_active == "1" ? 1 : 0, client_id]
    );

    res.json({ message: "تمت الإضافة بنجاح", id: result.insertId });
  } catch (err) {
    console.error("Add Section Error:", err);
    res.status(500).json({ error: "فشل في إضافة القسم" });
  }
};

// ✅ جلب أقسام العميل
exports.getSections = async (req, res) => {
  const client_id = req.user.id;
  const link_code = req.user?.link_code;

  try {
    const [rows] = await db.query(
      `SELECT * FROM sections WHERE se_client_id = ?`,
      [client_id]
    );

    const sections = rows.map((row) => ({
      ...row,
      link_code,
    }));

    res.json(sections);
  } catch (err) {
    console.error("Get Sections Error:", err);
    res.status(500).json({ error: "خطأ أثناء جلب الأقسام" });
  }
};

// ✅ جلب قسم واحد
exports.getSectionById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM sections WHERE se_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "القسم غير موجود" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get Section Error:", err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
};

// ✅ تعديل قسم
exports.updateSection = async (req, res) => {
  const { id } = req.params;
  const { name, description, is_active } = req.body;
  const active = parseInt(is_active) === 1 ? 1 : 0;

  try {
    const [rows] = await db.query("SELECT * FROM sections WHERE se_id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "القسم غير موجود" });
    }

    let imageUrl = rows[0].se_image;

    if (req.file) {
      const uploadResult = await imagekit.upload({
        file: req.file.buffer,
        fileName: Date.now() + path.extname(req.file.originalname),
        folder: `/menu_project/sections/${req.user?.link_code}`,
      });
      imageUrl = uploadResult.url;
    }

    await db.query(
      `UPDATE sections 
       SET se_name = ?, se_description = ?, se_image = ?, se_is_active = ?
       WHERE se_id = ?`,
      [name, description, imageUrl, active, id]
    );

    res.json({ message: "تم تحديث القسم بنجاح" });
  } catch (err) {
    console.error("Update Section Error:", err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
};

// ✅ جلب كل الأقسام (لأغراض أخرى)
exports.getAllSections = async (req, res) => {
  const { client_id } = req.query;

  try {
    const [rows] = await db.query(
      "SELECT * FROM sections WHERE se_client_id = ?",
      [client_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Get All Sections Error:", err);
    res.status(500).json({ error: "فشل في جلب الأقسام" });
  }
};

// ✅ حذف قسم
exports.deleteSection = async (req, res) => {
  const { id } = req.params;

  try {
    const [itemRows] = await db.query(
      "SELECT COUNT(*) AS count FROM items WHERE it_se_id = ?",
      [id]
    );
    if (itemRows[0].count > 0) {
      return res.status(400).json({
        error: "لا يمكن حذف القسم لوجود أصناف مرتبطة به. يرجى حذفها أولاً.",
      });
    }

    await db.query("DELETE FROM sections WHERE se_id = ?", [id]);
    res.json({ message: "تم حذف القسم بنجاح" });
  } catch (err) {
    console.error("Delete Section Error:", err);
    res.status(500).json({ error: "فشل في حذف القسم" });
  }
};
