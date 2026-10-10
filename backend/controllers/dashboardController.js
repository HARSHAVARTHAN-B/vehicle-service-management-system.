const db = require('../config/database');

const getDashboardData = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Total Customers
    const [[{ totalCustomers }]] = await db.query('SELECT COUNT(*) as totalCustomers FROM customers');

    // 2. Total Vehicles
    const [[{ totalVehicles }]] = await db.query('SELECT COUNT(*) as totalVehicles FROM vehicles');

    // 3. Today Bookings
    const [[{ todayBookings }]] = await db.query('SELECT COUNT(*) as todayBookings FROM bookings WHERE booking_date = ?', [todayStr]);

    // 4. Pending Services
    const [[{ pendingServices }]] = await db.query("SELECT COUNT(*) as pendingServices FROM bookings WHERE status IN ('Pending', 'Confirmed', 'In Progress')");

    // 5. Completed Services
    const [[{ completedServices }]] = await db.query("SELECT COUNT(*) as completedServices FROM bookings WHERE status = 'Completed'");

    // 6. Total Revenue from Paid Payments
    const [[{ totalRevenue }]] = await db.query("SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM payments WHERE status = 'Paid'");

    // 7. Booking Statistics by Status
    const [bookingStatsRows] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM bookings 
      GROUP BY status
    `);

    const bookingStats = {
      Pending: 0,
      Confirmed: 0,
      InProgress: 0,
      Completed: 0,
      Cancelled: 0
    };

    bookingStatsRows.forEach(row => {
      if (row.status === 'In Progress') {
        bookingStats.InProgress = row.count;
      } else if (bookingStats[row.status] !== undefined) {
        bookingStats[row.status] = row.count;
      }
    });

    // 8. Monthly Revenue for charts (Last 6 months)
    const [monthlyRevenueRows] = await db.query(`
      SELECT 
        DATE_FORMAT(payment_date, '%b %Y') as month,
        DATE_FORMAT(payment_date, '%Y-%m') as yearMonth,
        COALESCE(SUM(amount), 0) as revenue
      FROM payments
      WHERE status = 'Paid'
      GROUP BY yearMonth, month
      ORDER BY yearMonth ASC
      LIMIT 6
    `);

    // 9. Monthly Bookings count for charts (Last 6 months)
    const [monthlyBookingsRows] = await db.query(`
      SELECT 
        DATE_FORMAT(booking_date, '%b %Y') as month,
        DATE_FORMAT(booking_date, '%Y-%m') as yearMonth,
        COUNT(*) as totalBookings,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedBookings
      FROM bookings
      GROUP BY yearMonth, month
      ORDER BY yearMonth ASC
      LIMIT 6
    `);

    // 10. Popular Services frequency
    const [popularServicesRows] = await db.query(`
      SELECT 
        service_type as name, 
        COUNT(*) as count,
        COALESCE(SUM(total_cost), 0) as revenue
      FROM service_records
      GROUP BY service_type
      ORDER BY count DESC
      LIMIT 5
    `);

    // 11. Recent Bookings (for dashboard list)
    const [recentBookingsRows] = await db.query(`
      SELECT 
        b.booking_id, b.service_type, b.booking_date, b.booking_time, b.status, b.estimated_cost,
        c.name as customer_name, v.registration_number, v.brand as vehicle_brand, v.model as vehicle_model
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      ORDER BY b.id DESC
      LIMIT 5
    `);

    return res.json({
      success: true,
      data: {
        totalCustomers,
        totalVehicles,
        todayBookings,
        pendingServices,
        completedServices,
        totalRevenue: parseFloat(totalRevenue),
        bookingStats,
        monthlyRevenue: monthlyRevenueRows,
        monthlyBookings: monthlyBookingsRows,
        popularServices: popularServicesRows,
        recentBookings: recentBookingsRows
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData
};
