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
      clientsPerDay: {
        days: [],
        counts: [],
      },
    };

    // العملاء
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM clients"
    );
    const [[{ active }]] = await db.query(
      "SELECT COUNT(*) AS active FROM clients WHERE cl_status = 1"
    );
    const [[{ inactive }]] = await db.query(
      "SELECT COUNT(*) AS inactive FROM clients WHERE cl_status = 0"
    );

    // الاشتراكات
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

    // طلبات الاشتراك
    const [[{ totalRequests }]] = await db.query(
      "SELECT COUNT(*) AS totalRequests FROM subscription_requests"
    );
    const [[{ newRequests }]] = await db.query(
      "SELECT COUNT(*) AS newRequests FROM subscription_requests WHERE sl_status = 1"
    );

    // تخزين القيم
    stats.totalClients = total;
    stats.activeClients = active;
    stats.inactiveClients = inactive;
    stats.activeSubscriptions = subs;
    stats.trialSubscriptions = trial;
    stats.firstSubscriptions = first;
    stats.renewSubscriptions = renew;
    stats.totalSubscribeRequests = totalRequests;
    stats.newSubscribeRequests = newRequests;

    // الرسم البياني للعملاء
    const [dailyCounts] = await db.query(`
      SELECT DATE(cl_created_at) AS date, COUNT(*) AS count
      FROM clients
      WHERE cl_created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(cl_created_at)
      ORDER BY DATE(cl_created_at)
    `);

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

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const match = dailyCounts.find((row) => row.date === dateStr);

      stats.clientsPerDay.days.push(daysMap[date.getDay()]);
      stats.clientsPerDay.counts.push(match ? match.count : 0);
    }

    return res.json(stats);
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
};
