const db = require("../../shared/db");

exports.getVisitsPerDay = async (req, res) => {
  try {
    const clientId = req.query.clientId;
    const data = await fetchVisitsPerDay(clientId);
    res.json(data);
  } catch (err) {
    console.error("Visits Chart Error:", err);
    res.status(500).json({ error: "خطأ في جلب الرسم البياني" });
  }
};

// دالة مساعدة
async function fetchVisitsPerDay(clientId) {
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
