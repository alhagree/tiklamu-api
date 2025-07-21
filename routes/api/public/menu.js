const express = require("express");
const router = express.Router();
const db = require("../../../shared/db");

router.get("/:link_code", async (req, res) => {
  const linkCode = req.params.link_code;

  try {
    // 1. جلب us_user وربطه بـ client و settings
    const userQuery = `
      SELECT 
        cl.cl_id,
        cl.cl_name AS client_name,
        st.st_logo AS logo,
        us.us_is_active as US_ACTIVE,
        cl.cl_is_active as CL_ACTIVE
      FROM us_users us
      JOIN clients cl ON cl.cl_id = us.us_client_id
      LEFT JOIN settings st ON st.st_cl_id = cl.cl_id
      WHERE us.us_link_code = ?
      LIMIT 1
    `;
    const [userRows] = await db.query(userQuery, [linkCode]);

    if (userRows.length === 0)
      return res.status(404).json({ message: "العميل غير موجود أو غير مفعل" });

    const client = userRows[0];

    console.debug("client.US_ACTIVE : ", client.US_ACTIVE);
    console.debug("client.CL_ACTIVE : ", client.CL_ACTIVE);

    if (client.US_ACTIVE == 0 || client.CL_ACTIVE == 0)
      return res.status(404).json({ message: "العميل غير مفعل" });

    // 2. فحص الاشتراك الفعّال والمنتهي
    const [subRows] = await db.query(`
      SELECT *
      FROM subscriptions
      WHERE su_client_id = ?
        AND su_status = 1
        AND su_end_date >= CURRENT_DATE()
      ORDER BY su_start_date DESC
      LIMIT 1
    `, [client.cl_id]);

    console.debug("عدد الاشتراكات الفعالة:", subRows.length);
    console.debug("الاشتراك:", subRows[0]);


    if (subRows.length === 0)
      return res.status(403).json({ message: "الاشتراك غير فعّال أو منتهي" });

    // 3. جلب الأقسام الخاصة بالعميل
    const [sections] = await db.query(`
      SELECT se_id, se_name, se_image
      FROM sections
      WHERE se_client_id = ? AND se_is_active = 1
      ORDER BY se_id ASC
    `, [client.cl_id]);

    // 4. جلب الأصناف المرتبطة بأقسام العميل
    const [itemsRaw] = await db.query(`
      SELECT it_id, it_se_id, it_name, it_price, it_description, it_image, it_available
      FROM items
      WHERE it_se_id IN (
        SELECT se_id FROM sections WHERE se_client_id = ? AND se_is_active = 1
      ) AND it_is_active = 1
      ORDER BY it_id ASC
    `, [client.cl_id]);

    // 5. تنسيق الأسعار
    const items = itemsRaw.map(item => ({
      ...item,
      it_price: Number(item.it_price).toLocaleString('en-US'),
    }));

    // 6. إرسال الاستجابة
    res.json({
      client_name: client.client_name,
      logo_url: client.logo,
      sections,
      items,
    });

  } catch (err) {
    console.error("⚠️ خطأ في جلب المنيو:", err);
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
});

module.exports = router;
