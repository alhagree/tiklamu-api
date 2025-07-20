// backend/controllers/agent/ItemsController.js
const db = require("../../shared/db");
const path = require("path");
const imagekit = require("../../utils/imagekit"); // ✅ استخدام ImageKit

// ✅ إنشاء صنف
exports.createItem = async (req, res) => {
  try {
    const {
      it_name,
      it_price,
      it_description,
      it_se_id,
      it_is_active,
    } = req.body;

    let imageUrl = null;

    if (req.file) {
      const uploadedImage = await imagekit.upload({
        file: req.file.buffer,
        fileName: `${Date.now()}-${req.file.originalname}`,
        folder: `/menu_project/items/${req.user.link_code}`,
      });
      imageUrl = uploadedImage.url;
    }

    const sql = `
      INSERT INTO items (it_name, it_price, it_description, it_se_id, it_is_active, it_image)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      it_name,
      parseFloat(it_price),
      it_description || "",
      parseInt(it_se_id),
      it_is_active == "1" ? 1 : 0,
      imageUrl,
    ];

    const [result] = await db.query(sql, params);
    res.json({ success: true, it_id: result.insertId });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: "حدث خطأ أثناء إضافة الصنف" });
  }
};

// ✅ جلب كل الأصناف
exports.getAllItems = async (req, res) => {
  try {
    const client_id = req.user.id;
    const link_code = req.user?.link_code;

    const sql = `
      SELECT it.*, ms.se_name
      FROM items it
      JOIN sections ms ON ms.se_id = it.it_se_id
      WHERE ms.se_client_id = ?      
      ORDER BY it.it_id DESC
    `;

    const [rows] = await db.query(sql, [client_id]);

    const items = rows.map((row) => ({
      ...row,
      link_code,
    }));

    res.json(items);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: "فشل في جلب الأصناف" });
  }
};

// ✅ جلب صنف واحد
exports.getOneItem = async (req, res) => {
  try {
    const id = req.params.id;
    const link_code = req.user?.link_code;

    const sql = `
      SELECT it.*, ms.se_name
      FROM items it
      JOIN sections ms ON ms.se_id = it.it_se_id
      WHERE it.it_id = ?
    `;

    const [rows] = await db.query(sql, [id]);
    const row = rows[0];

    if (!row) {
      return res.status(404).json({ error: "الصنف غير موجود" });
    }

    row.link_code = link_code;
    res.json(row);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: "فشل في جلب بيانات الصنف" });
  }
};

// ✅ تحديث صنف
exports.updateItem = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      it_name,
      it_price,
      it_description,
      it_se_id,
      it_is_active,
      it_available,
    } = req.body;

    let imageUrl = null;

    if (req.file) {
      const uploadedImage = await imagekit.upload({
        file: req.file.buffer,
        fileName: `${Date.now()}-${req.file.originalname}`,
        folder: `/menu_project/items/${req.user.link_code}`,
      });
      imageUrl = uploadedImage.url;
    }

    let sql = `
      UPDATE items SET
        it_name = ?,
        it_price = ?,
        it_description = ?,
        it_se_id = ?,
        it_is_active = ?
        it_available = ?
    `;
    const params = [
      it_name,
      parseFloat(it_price),
      it_description || "",
      parseInt(it_se_id),
      it_is_active == "1" ? 1 : 0,
      it_available == "1" ? 1 : 0,
    ];

    if (imageUrl) {
      sql += `, it_image = ?`;
      params.push(imageUrl);
    }

    sql += ` WHERE it_id = ?`;
    params.push(id);

    const [result] = await db.query(sql, params);
    res.json({ success: true });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: "فشل في تعديل الصنف" });
  }
};

// ✅ حذف صنف
exports.deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    const sql = `DELETE FROM items WHERE it_id = ?`;

    const [result] = await db.query(sql, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: "فشل في حذف الصنف" });
  }
};
