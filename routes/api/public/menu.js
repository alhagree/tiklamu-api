//backend\routes\api\public\menu.js
const express = require("express");
const router = express.Router();
const db = require("../../../shared/db");

router.get("/:link_code", async (req, res) => {
  const linkCode = req.params.link_code;

  try {
    // 1. جلب المستخدم والعميل والإعدادات
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
      return res.status(404).json({
        message: "العميل المطلوب لا تتوفر بياناته.",
        error_code: "client_not_found"
      });

    const client = userRows[0];

    if (client.US_ACTIVE == 0 || client.CL_ACTIVE == 0)
      return res.status(403).json({
        message: "تم تعطيل الحساب، يرجى التواصل مع الادارة لتشغيله",
        error_code: "account_inactive"
      });

    // 2. جلب الاشتراك الفعّال
    const [subRows] = await db.query(`
      SELECT su_type, su_start_date, su_end_date, su_duration
      FROM subscriptions
      WHERE su_client_id = ? AND su_status = 'active'
      ORDER BY su_start_date DESC
      LIMIT 1
    `, [client.cl_id]);

    if (subRows.length === 0)
      return res.status(403).json({
        message: "تم ايقاف الاشتراك مؤقتا من قبل الادارة، يرجى التواصل لاعادة التفعيل",
        error_code: "subscription_inactive"
      });

    const subscription = subRows[0];
    const end = new Date(subscription.su_end_date);
    const today = new Date();

    // إضافة 7 أيام على تاريخ نهاية الاشتراك
    const graceLimit = new Date(end);
    graceLimit.setDate(graceLimit.getDate() + 7);

    // الآن: إذا تاريخ اليوم > تاريخ السماح → المنيو يتوقف
    if (today > graceLimit) {
      return res.status(403).json({
        message: "انتهت مدة الاشتراك، تواصل مع الادارة للتجديد",
        error_code: "subscription_expired"
      });
    }


    // 3. جلب الأقسام
    const [sections] = await db.query(`
      SELECT se_id, se_name, se_image
      FROM sections
      WHERE se_client_id = ? AND se_is_active = 1
      ORDER BY se_id ASC
    `, [client.cl_id]);

    // 4. جلب الأصناف
    const [itemsRaw] = await db.query(`
      SELECT it_id, it_se_id, it_name, it_price, it_description, it_image, it_available
      FROM items
      WHERE it_se_id IN (
        SELECT se_id FROM sections WHERE se_client_id = ? AND se_is_active = 1
      ) AND it_is_active = 1
      ORDER BY it_id ASC
    `, [client.cl_id]);

    const items = itemsRaw.map(item => ({
      ...item,
      it_price: Number(item.it_price).toLocaleString('en-US'),
    }));

    // 5. الاستجابة النهائية
    res.json({
      client_name: client.client_name,
      logo_url: client.logo,
      subscription: {
        type: subscription.su_type,
        start_date: subscription.su_start_date.toString('utf8'),
        end_date: endDateStr,
        duration: subscription.su_duration
      },
      sections,
      items,
    });

  } catch (err) {
    console.error("⚠️ خطأ في جلب المنيو:", err);
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
});

module.exports = router;