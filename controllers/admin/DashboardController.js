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
      clientsPerDay: {
        days: [],
        counts: [],
      },
    };

    const [result1] = await db.query("SELECT COUNT(*) AS total FROM clients");
    stats.totalClients = result1[0].total;

    const [result2] = await db.query("SELECT COUNT(*) AS active FROM clients WHERE cl_status = 1");
    stats.activeClients = result2[0].active;

    const [result3] = await db.query("SELECT COUNT(*) AS inactive FROM clients WHERE cl_status = 0");
    stats.inactiveClients = result3[0].inactive;

    const [result4] = await db.query("SELECT COUNT(*) AS subs FROM subscriptions WHERE su_end_date > NOW()");
    stats.activeSubscriptions = result4[0].subs;

    const [resTrial] = await db.query("SELECT COUNT(*) AS trial FROM subscriptions WHERE su_type = 'trial'");
    stats.trialSubscriptions = resTrial[0].trial;

    const [resFirst] = await db.query("SELECT COUNT(*) AS first FROM subscriptions WHERE su_type = 'first'");
    stats.firstSubscriptions = resFirst[0].first;
 
    const [resRenew] = await db.query("SELECT COUNT(*) AS renew FROM subscriptions WHERE su_type = 'renew'");
    stats.renewSubscriptions = resRenew[0].renew;

    // الرسم البياني الأسبوعي للعملاء
    const [result5] = await db.query(`
      SELECT DATE(cl_created_at) as date, COUNT(*) as count
      FROM clients
      WHERE cl_created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(cl_created_at)
      ORDER BY DATE(cl_created_at)
    `);

    const daysMap = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const found = result5.find(row => {
        const rowDate = new Date(row.date);
        return rowDate.toISOString().split("T")[0] === dateStr;
      });

      stats.clientsPerDay.days.push(daysMap[date.getDay()]);
      stats.clientsPerDay.counts.push(found ? found.count : 0);
    }

    return res.json(stats);

  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
};
