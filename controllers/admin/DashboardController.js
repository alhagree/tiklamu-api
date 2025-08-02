const db = require("../../shared/db");

exports.getStats = async (req, res) => {
  try {
    const stats = {
      totalClients: 0,
      activeClients: 0,
      inactiveClients: 0,
      activeSubscriptions: 0,
      trialSubscriptions: 0,
      firstSubscriptions: 0,
      renewSubscriptions: 0,
      totalSubscribeRequests: 0,
      newSubscribeRequests: 0,
      visitsPerDay: {
        days: [],
        counts: [],
      },
    };

    // إحصائيات البطاقات
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM clients"
    );
    const [[{ active }]] = await db.query(
      "SELECT COUNT(*) AS active FROM clients WHERE cl_status = 1"
    );
    const [[{ inactive }]] = await db.query(
      "SELECT COUNT(*) AS inactive FROM clients WHERE cl_status = 0"
    );
    const [[{ subs }]] = await db.query(
      "SELECT COUNT(*) AS subs FROM subscriptions WHERE su_end_date > NOW()"
    );
    const [[{ trial }]] = await db.query(
      "SELECT COUNT(*) AS trial FROM subscriptions WHERE su_type = 'trial'"
    );
    const [[{ first }]] = await db.query(
      "SELECT COUNT(*) AS first FROM subscriptions WHERE su_type = 'first'"
    );
    const [[{ renew }]] = await db.query(
      "SELECT COUNT(*) AS renew FROM subscriptions WHERE su_type = 'renew'"
    );
    const [[{ totalRequests }]] = await db.query(
      "SELECT COUNT(*) AS totalRequests FROM subscription_requests"
    );
    const [[{ newRequests }]] = await db.query(
      "SELECT COUNT(*) AS newRequests FROM subscription_requests WHERE sr_status = 1"
    );

    stats.totalClients = total;
    stats.activeClients = active;
    stats.inactiveClients = inactive;
    stats.activeSubscriptions = subs;
    stats.trialSubscriptions = trial;
    stats.firstSubscriptions = first;
    stats.renewSubscriptions = renew;
    stats.totalSubscribeRequests = totalRequests;
    stats.newSubscribeRequests = newRequests;

    // 🔁 جلب بيانات الرسم البياني من الدالة
    const clientId = req.query.clientId;
    stats.visitsPerDay = await getVisitsPerDay(clientId);

    return res.json(stats);
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
};

// دالة مساعدة لجلب عدد الزيارات لكل يوم
async function getVisitsPerDay(clientId) {
  const db = require("../../shared/db");

  let visitRows = [];

  if (clientId && clientId.trim() !== "") {
    const [[user]] = await db.query(
      `SELECT us_link_code FROM us_users WHERE us_client_id = ? LIMIT 1`,
      [clientId]
    );

    if (user && user.us_link_code) {
      const [rows] = await db.query(
        `
        SELECT 
          DATE(DATE_ADD(vs_visit_time, INTERVAL 3 HOUR)) AS visit_date, 
          COUNT(*) AS count
        FROM visits
        WHERE vs_us_link_code = ?
          AND vs_visit_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY visit_date
        ORDER BY visit_date
        `,
        [user.us_link_code]
      );
      visitRows = rows;
    }
  } else {
    const [rows] = await db.query(
      `
      SELECT 
        DATE(DATE_ADD(vs_visit_time, INTERVAL 3 HOUR)) AS visit_date, 
        COUNT(*) AS count
      FROM visits
      WHERE vs_visit_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY visit_date
      ORDER BY visit_date
      `
    );
    visitRows = rows;
  }

  // تجهيز البيانات للأيام السبعة الماضية
  const daysMap = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  const today = new Date();

  const days = [];
  const counts = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const match = visitRows.find((row) => {
      const rowDate = new Date(row.visit_date).toISOString().split("T")[0];
      return rowDate === dateStr;
    });

    days.push(daysMap[date.getDay()]);
    counts.push(match ? match.count : 0);
  }

  return { days, counts };
}
