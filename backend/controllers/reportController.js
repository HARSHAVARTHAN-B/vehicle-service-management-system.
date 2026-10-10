const db = require('../config/database');

const getRevenueReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const conditions = ["p.status = 'Paid'"];
    const params = [];

    if (from) {
      conditions.push('p.payment_date >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('p.payment_date <= ?');
      params.push(to);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [dailyRevenue] = await db.query(`
      SELECT 
        DATE_FORMAT(p.payment_date, '%Y-%m-%d') as date,
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COUNT(p.id) as total_transactions
      FROM payments p
      ${whereClause}
      GROUP BY date
      ORDER BY date ASC
    `, params);

    const [paymentMethodBreakdown] = await db.query(`
      SELECT 
        p.payment_method as name,
        COALESCE(SUM(p.amount), 0) as value,
        COUNT(p.id) as count
      FROM payments p
      ${whereClause}
      GROUP BY p.payment_method
    `, params);

    const [[{ grandTotal }]] = await db.query(`
      SELECT COALESCE(SUM(p.amount), 0) as grandTotal
      FROM payments p
      ${whereClause}
    `, params);

    return res.json({
      success: true,
      data: {
        grandTotal: parseFloat(grandTotal),
        dailyRevenue,
        paymentMethodBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

const getBookingsReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const conditions = [];
    const params = [];

    if (from) {
      conditions.push('booking_date >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('booking_date <= ?');
      params.push(to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [statusBreakdown] = await db.query(`
      SELECT status as name, COUNT(*) as value
      FROM bookings
      ${whereClause}
      GROUP BY status
    `, params);

    const [dailyBookings] = await db.query(`
      SELECT 
        DATE_FORMAT(booking_date, '%Y-%m-%d') as date,
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_bookings
      FROM bookings
      ${whereClause}
      GROUP BY date
      ORDER BY date ASC
    `, params);

    return res.json({
      success: true,
      data: {
        statusBreakdown,
        dailyBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

const getServicesReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const conditions = [];
    const params = [];

    if (from) {
      conditions.push('service_date >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('service_date <= ?');
      params.push(to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [serviceTypes] = await db.query(`
      SELECT 
        service_type as name,
        COUNT(*) as total_services,
        COALESCE(SUM(parts_cost), 0) as total_parts_cost,
        COALESCE(SUM(labor_cost), 0) as total_labor_cost,
        COALESCE(SUM(total_cost), 0) as total_revenue
      FROM service_records
      ${whereClause}
      GROUP BY service_type
      ORDER BY total_services DESC
    `, params);

    return res.json({
      success: true,
      data: {
        serviceTypes
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMechanicsReport = async (req, res, next) => {
  try {
    const [mechanicPerformance] = await db.query(`
      SELECT 
        m.mechanic_id,
        m.name,
        m.specialization,
        m.status,
        COUNT(b.id) as total_assigned,
        SUM(CASE WHEN b.status = 'Completed' THEN 1 ELSE 0 END) as total_completed,
        COALESCE(SUM(sr.total_cost), 0) as revenue_generated
      FROM mechanics m
      LEFT JOIN bookings b ON m.mechanic_id = b.mechanic_id
      LEFT JOIN service_records sr ON b.booking_id = sr.booking_id
      GROUP BY m.mechanic_id, m.name, m.specialization, m.status
      ORDER BY total_completed DESC
    `);

    return res.json({
      success: true,
      data: {
        mechanicPerformance
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCustomersReport = async (req, res, next) => {
  try {
    const [topCustomers] = await db.query(`
      SELECT 
        c.customer_id,
        c.name,
        c.email,
        c.phone,
        COUNT(DISTINCT v.id) as total_vehicles,
        COUNT(DISTINCT b.id) as total_bookings,
        COALESCE(SUM(p.amount), 0) as total_spent
      FROM customers c
      LEFT JOIN vehicles v ON c.customer_id = v.customer_id
      LEFT JOIN bookings b ON c.customer_id = b.customer_id
      LEFT JOIN payments p ON c.customer_id = p.customer_id AND p.status = 'Paid'
      GROUP BY c.customer_id, c.name, c.email, c.phone
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    return res.json({
      success: true,
      data: {
        topCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRevenueReport,
  getBookingsReport,
  getServicesReport,
  getMechanicsReport,
  getCustomersReport
};
