const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seed() {
  try {
    console.log('Starting AutoCare Pro database initialization and seeding...');
    await db.initializeDatabase();

    // 1. Clear existing table data in reverse dependency order
    await db.query('DELETE FROM payments');
    await db.query('DELETE FROM service_records');
    await db.query('DELETE FROM bookings');
    await db.query('DELETE FROM mechanics');
    await db.query('DELETE FROM vehicles');
    await db.query('DELETE FROM customers');
    await db.query('DELETE FROM users');

    console.log('Tables cleared successfully.');

    // 2. Default Admin User
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const staffPasswordHash = await bcrypt.hash('staff123', 10);

    await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Admin Manager', 'admin@autocare.com', adminPasswordHash, 'admin', '+91 98765 43210']
    );

    await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Service Staff', 'staff@autocare.com', staffPasswordHash, 'staff', '+91 98765 43211']
    );

    console.log('User accounts created.');

    // 3. Customers (20 Realistic Indian Customers)
    const customersData = [
      { id: 'CUS-1001', name: 'Arun Karthik', email: 'arun.karthik@gmail.com', phone: '+91 98401 12345', address: '12 Gandhi Salai, T. Nagar, Chennai, Tamil Nadu' },
      { id: 'CUS-1002', name: 'Priya Raman', email: 'priya.raman@yahoo.com', phone: '+91 98402 23456', address: '45 Avinashi Road, Coimbatore, Tamil Nadu' },
      { id: 'CUS-1003', name: 'Rajesh Kumar', email: 'rajesh.kumar@outlook.com', phone: '+91 98403 34567', address: '78 MG Road, Bengaluru, Karnataka' },
      { id: 'CUS-1004', name: 'Ananya Sharma', email: 'ananya.s@gmail.com', phone: '+91 98404 45678', address: '23 Park Street, Hyderabad, Telangana' },
      { id: 'CUS-1005', name: 'Suresh Patel', email: 'suresh.patel@hotmail.com', phone: '+91 98405 56789', address: '89 SG Highway, Ahmedabad, Gujarat' },
      { id: 'CUS-1006', name: 'Vijay Sundaram', email: 'vijay.sun@gmail.com', phone: '+91 98406 67890', address: '56 KK Nagar, Madurai, Tamil Nadu' },
      { id: 'CUS-1007', name: 'Lakshmi Narayanan', email: 'lakshmi.n@gmail.com', phone: '+91 98407 78901', address: '34 RS Puram, Coimbatore, Tamil Nadu' },
      { id: 'CUS-1008', name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '+91 98408 89012', address: '101 FC Road, Pune, Maharashtra' },
      { id: 'CUS-1009', name: 'Deepa Varma', email: 'deepa.varma@rediffmail.com', phone: '+91 98409 90123', address: '67 Marine Drive, Kochi, Kerala' },
      { id: 'CUS-1010', name: 'Manoj Pillai', email: 'manoj.pillai@gmail.com', phone: '+91 98410 01234', address: '15 Kowdiar, Thiruvananthapuram, Kerala' },
      { id: 'CUS-1011', name: 'Kavitha Swaminathan', email: 'kavitha.s@gmail.com', phone: '+91 98411 12345', address: '90 Anna Nagar, Chennai, Tamil Nadu' },
      { id: 'CUS-1012', name: 'Siddharth Rao', email: 'siddharth.rao@gmail.com', phone: '+91 98412 23456', address: '44 Indiranagar, Bengaluru, Karnataka' },
      { id: 'CUS-1013', name: 'Meena Krishnan', email: 'meena.k@yahoo.com', phone: '+91 98413 34567', address: '77 Besant Nagar, Chennai, Tamil Nadu' },
      { id: 'CUS-1014', name: 'Karthik Raja', email: 'karthik.raja@gmail.com', phone: '+91 98414 45678', address: '28 DB Road, Coimbatore, Tamil Nadu' },
      { id: 'CUS-1015', name: 'Divya Deshmukh', email: 'divya.d@gmail.com', phone: '+91 98415 56789', address: '19 FC Road, Nagpur, Maharashtra' },
      { id: 'CUS-1016', name: 'Rohan Mehta', email: 'rohan.mehta@gmail.com', phone: '+91 98416 67890', address: '82 Juhu Tara Road, Mumbai, Maharashtra' },
      { id: 'CUS-1017', name: 'Shalini Gupta', email: 'shalini.g@gmail.com', phone: '+91 98417 78901', address: '53 Connaught Place, New Delhi' },
      { id: 'CUS-1018', name: 'Ganesh Iyer', email: 'ganesh.iyer@gmail.com', phone: '+91 98418 89012', address: '61 Velachery Main Rd, Chennai, Tamil Nadu' },
      { id: 'CUS-1019', name: 'Nandini Sen', email: 'nandini.sen@gmail.com', phone: '+91 98419 90123', address: '39 Salt Lake, Kolkata, West Bengal' },
      { id: 'CUS-1020', name: 'Arvind Swamy', email: 'arvind.swamy@gmail.com', phone: '+91 98420 01234', address: '14 Race Course, Trichy, Tamil Nadu' }
    ];

    for (const c of customersData) {
      await db.query(
        'INSERT INTO customers (customer_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
        [c.id, c.name, c.email, c.phone, c.address]
      );
    }
    console.log('20 Customers seeded.');

    // 4. Vehicles (25 Vehicles)
    const vehiclesData = [
      { id: 'VEH-1001', customer_id: 'CUS-1001', reg: 'TN 38 AB 1234', brand: 'Hyundai', model: 'Creta', type: 'SUV', fuel: 'Diesel', year: 2022, color: 'Polar White', mileage: 28500 },
      { id: 'VEH-1002', customer_id: 'CUS-1001', reg: 'TN 38 XY 9876', brand: 'Royal Enfield', model: 'Classic 350', type: 'Bike', fuel: 'Petrol', year: 2021, color: 'Stealth Black', mileage: 14200 },
      { id: 'VEH-1003', customer_id: 'CUS-1002', reg: 'TN 09 CD 5678', brand: 'Maruti Suzuki', model: 'Swift Dzire', type: 'Car', fuel: 'Petrol', year: 2020, color: 'Magma Grey', mileage: 45000 },
      { id: 'VEH-1004', customer_id: 'CUS-1003', reg: 'KA 05 MN 3412', brand: 'Tata', model: 'Nexon EV', type: 'SUV', fuel: 'Electric', year: 2023, color: 'Teal Blue', mileage: 18900 },
      { id: 'VEH-1005', customer_id: 'CUS-1004', reg: 'TS 08 EF 9012', brand: 'Honda', model: 'City', type: 'Car', fuel: 'Petrol', year: 2019, color: 'Radiant Red', mileage: 52000 },
      { id: 'VEH-1006', customer_id: 'CUS-1005', reg: 'GJ 01 RS 7890', brand: 'Mahindra', model: 'XUV700', type: 'SUV', fuel: 'Diesel', year: 2022, color: 'Midnight Black', mileage: 31000 },
      { id: 'VEH-1007', customer_id: 'CUS-1006', reg: 'TN 59 PQ 4321', brand: 'TVS', model: 'Jupiter', type: 'Bike', fuel: 'Petrol', year: 2021, color: 'Matte Blue', mileage: 12500 },
      { id: 'VEH-1008', customer_id: 'CUS-1007', reg: 'TN 37 BC 6543', brand: 'Toyota', model: 'Innova Crysta', type: 'Van', fuel: 'Diesel', year: 2018, color: 'Silver Metallic', mileage: 88000 },
      { id: 'VEH-1009', customer_id: 'CUS-1008', reg: 'MH 12 LM 8765', brand: 'Kia', model: 'Seltos', type: 'SUV', fuel: 'CNG', year: 2021, color: 'Gravity Grey', mileage: 36000 },
      { id: 'VEH-1010', customer_id: 'CUS-1009', reg: 'KL 07 BK 2345', brand: 'Maruti Suzuki', model: 'Baleno', type: 'Car', fuel: 'Petrol', year: 2020, color: 'Nexa Blue', mileage: 41000 },
      { id: 'VEH-1011', customer_id: 'CUS-1010', reg: 'KL 01 CA 9988', brand: 'Yamaha', model: 'MT-15', type: 'Bike', fuel: 'Petrol', year: 2022, color: 'Cyan Storm', mileage: 9800 },
      { id: 'VEH-1012', customer_id: 'CUS-1011', reg: 'TN 01 DA 4455', brand: 'BMW', model: '3 Series', type: 'Car', fuel: 'Petrol', year: 2021, color: 'Phytonic Blue', mileage: 22000 },
      { id: 'VEH-1013', customer_id: 'CUS-1012', reg: 'KA 03 EV 1122', brand: 'Ather', model: '450X', type: 'Bike', fuel: 'Electric', year: 2023, color: 'Space Grey', mileage: 6400 },
      { id: 'VEH-1014', customer_id: 'CUS-1013', reg: 'TN 07 FE 3344', brand: 'Volkswagen', model: 'Virtus', type: 'Car', fuel: 'Petrol', year: 2022, color: 'Wild Cherry Red', mileage: 16500 },
      { id: 'VEH-1015', customer_id: 'CUS-1014', reg: 'TN 38 ZZ 7788', brand: 'Mahindra', model: 'Thar', type: 'SUV', fuel: 'Diesel', year: 2021, color: 'Napoli Black', mileage: 29000 },
      { id: 'VEH-1016', customer_id: 'CUS-1015', reg: 'MH 31 AA 5566', brand: 'Tata', model: 'Punch', type: 'Car', fuel: 'CNG', year: 2022, color: 'Calypso Red', mileage: 19500 },
      { id: 'VEH-1017', customer_id: 'CUS-1016', reg: 'MH 02 BB 1212', brand: 'Mercedes-Benz', model: 'C-Class', type: 'Car', fuel: 'Hybrid', year: 2023, color: 'Obsidian Black', mileage: 11000 },
      { id: 'VEH-1018', customer_id: 'CUS-1017', reg: 'DL 01 CC 3434', brand: 'Maruti Suzuki', model: 'Ertiga', type: 'Van', fuel: 'CNG', year: 2019, color: 'Auburn Red', mileage: 67000 },
      { id: 'VEH-1019', customer_id: 'CUS-1018', reg: 'TN 10 DD 7878', brand: 'Skoda', model: 'Slavia', type: 'Car', fuel: 'Petrol', year: 2022, color: 'Tornado Red', mileage: 21000 },
      { id: 'VEH-1020', customer_id: 'CUS-1019', reg: 'WB 02 EE 9090', brand: 'Hyundai', model: 'i20', type: 'Car', fuel: 'Petrol', year: 2020, color: 'Fiery Red', mileage: 38000 },
      { id: 'VEH-1021', customer_id: 'CUS-1020', reg: 'TN 45 FF 2323', brand: 'Tata', model: 'Ace Gold', type: 'Truck', fuel: 'Diesel', year: 2018, color: 'White', mileage: 94000 },
      { id: 'VEH-1022', customer_id: 'CUS-1003', reg: 'KA 05 GG 6565', brand: 'KTM', model: 'Duke 390', type: 'Bike', fuel: 'Petrol', year: 2022, color: 'Orange Black', mileage: 12000 },
      { id: 'VEH-1023', customer_id: 'CUS-1006', reg: 'TN 59 HH 4343', brand: 'Force', model: 'Traveller', type: 'Van', fuel: 'Diesel', year: 2017, color: 'White', mileage: 115000 },
      { id: 'VEH-1024', customer_id: 'CUS-1011', reg: 'TN 01 II 8989', brand: 'MG', model: 'ZS EV', type: 'SUV', fuel: 'Electric', year: 2023, color: 'Ferris White', mileage: 8500 },
      { id: 'VEH-1025', customer_id: 'CUS-1016', reg: 'MH 02 JJ 1010', brand: 'Audi', model: 'A6', type: 'Car', fuel: 'Petrol', year: 2021, color: 'Ibis White', mileage: 25000 }
    ];

    for (const v of vehiclesData) {
      await db.query(
        `INSERT INTO vehicles 
          (vehicle_id, customer_id, registration_number, brand, model, vehicle_type, fuel_type, manufacturing_year, color, mileage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.customer_id, v.reg, v.brand, v.model, v.type, v.fuel, v.year, v.color, v.mileage]
      );
    }
    console.log('25 Vehicles seeded.');

    // 5. Mechanics (8 Specialized Mechanics)
    const mechanicsData = [
      { id: 'MEC-1001', name: 'Ramesh Sundaram', phone: '+91 97890 12345', email: 'ramesh.mech@autocare.com', spec: 'Engine', exp: '8 Years', status: 'Available' },
      { id: 'MEC-1002', name: 'Murugan K', phone: '+91 97890 23456', email: 'murugan.m@autocare.com', spec: 'Electrical', exp: '6 Years', status: 'Busy' },
      { id: 'MEC-1003', name: 'Dinesh Karthik', phone: '+91 97890 34567', email: 'dinesh.k@autocare.com', spec: 'Brakes', exp: '5 Years', status: 'Available' },
      { id: 'MEC-1004', name: 'Salim Khan', phone: '+91 97890 45678', email: 'salim.khan@autocare.com', spec: 'AC', exp: '7 Years', status: 'Available' },
      { id: 'MEC-1005', name: 'Gopalakrishnan V', phone: '+91 97890 56789', email: 'gopal.v@autocare.com', spec: 'Transmission', exp: '10 Years', status: 'Busy' },
      { id: 'MEC-1006', name: 'Santhosh Kumar', phone: '+91 97890 67890', email: 'santhosh.k@autocare.com', spec: 'General Service', exp: '4 Years', status: 'Available' },
      { id: 'MEC-1007', name: 'Anthony Joseph', phone: '+91 97890 78901', email: 'anthony.j@autocare.com', spec: 'Engine', exp: '9 Years', status: 'Available' },
      { id: 'MEC-1008', name: 'Praveen Chandran', phone: '+91 97890 89012', email: 'praveen.c@autocare.com', spec: 'Electrical', exp: '3 Years', status: 'Inactive' }
    ];

    for (const m of mechanicsData) {
      await db.query(
        `INSERT INTO mechanics 
          (mechanic_id, name, phone, email, specialization, experience, joining_date, availability, status)
         VALUES (?, ?, ?, ?, ?, ?, '2023-01-15', ?, ?)`,
        [m.id, m.name, m.phone, m.email, m.spec, m.exp, m.status === 'Available', m.status]
      );
    }
    console.log('8 Mechanics seeded.');

    // 6. Bookings (30 Realistic Bookings across 2026)
    const bookingsData = [];
    const statuses = ['Completed', 'Completed', 'Completed', 'In Progress', 'Confirmed', 'Pending', 'Cancelled'];
    const serviceTypes = [
      'Full Periodic Service', 'Engine Oil Change & Filter', 'AC Deep Cleaning & Gas Refill',
      'Brake Pad Replacement & Bleeding', 'Wheel Alignment & Balancing', 'Battery Replacement & Testing',
      'Clutch Plate Overhaul', 'Car Wash & Interior Detailing'
    ];

    for (let i = 1; i <= 30; i++) {
      const bId = `VS-${1000 + i}`;
      const customer = customersData[(i - 1) % customersData.length];
      const vehicle = vehiclesData[(i - 1) % vehiclesData.length];
      const mechanic = mechanicsData[(i - 1) % mechanicsData.length];
      const service = serviceTypes[i % serviceTypes.length];
      const status = i <= 20 ? 'Completed' : (i <= 23 ? 'In Progress' : (i <= 26 ? 'Confirmed' : (i <= 28 ? 'Pending' : 'Cancelled')));
      
      // Calculate realistic date in August 2026
      const day = (i % 28) + 1;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const bookingDate = `2026-08-${dayStr}`;
      const timeStr = `${10 + (i % 6)}:00:00`;
      const estCost = 1500 + (i * 350);

      bookingsData.push({
        bId, customerId: customer.id, vehicleId: vehicle.id, mechanicId: mechanic.id,
        service, bookingDate, timeStr, desc: `Customer requested ${service} and overall inspection.`,
        estCost, status
      });

      await db.query(
        `INSERT INTO bookings 
          (booking_id, customer_id, vehicle_id, mechanic_id, service_type, booking_date, booking_time, problem_description, estimated_cost, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bId, customer.id, vehicle.id, mechanic.id, service, bookingDate, timeStr, `Customer requested ${service} and overall health checkup.`, estCost, status]
      );
    }
    console.log('30 Bookings seeded.');

    // 7. Service Records (25 Service Records)
    const completedBookings = bookingsData.filter(b => b.status === 'Completed' || b.status === 'In Progress');
    for (let i = 0; i < Math.min(25, completedBookings.length); i++) {
      const b = completedBookings[i];
      const sId = `SRV-${1001 + i}`;
      const partsCost = Math.round(b.estCost * 0.6);
      const laborCost = Math.round(b.estCost * 0.4);
      const totalCost = partsCost + laborCost;

      await db.query(
        `INSERT INTO service_records 
          (service_id, booking_id, vehicle_id, mechanic_id, service_type, service_date, parts_cost, labor_cost, total_cost, mechanic_notes, customer_feedback, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sId, b.bId, b.vehicleId, b.mechanicId, b.service, b.bookingDate,
          partsCost, laborCost, totalCost,
          'Replaced genuine OEM parts. Tested vehicle performance on test track clean response.',
          'Excellent service! Car feels brand new.',
          b.status === 'Completed' ? 'Completed' : 'In Progress'
        ]
      );
    }
    console.log('25 Service records seeded.');

    // 8. Payments (25 Payments)
    const paymentMethods = ['UPI', 'Credit Card', 'Cash', 'Net Banking', 'Debit Card'];
    for (let i = 0; i < Math.min(25, completedBookings.length); i++) {
      const b = completedBookings[i];
      const pId = `PAY-${1001 + i}`;
      const method = paymentMethods[i % paymentMethods.length];
      const pStatus = i < 22 ? 'Paid' : (i === 22 ? 'Pending' : (i === 23 ? 'Failed' : 'Refunded'));
      const txnRef = method === 'Cash' ? 'CASH-REC-' + (9000 + i) : 'TXN' + Math.floor(100000000 + Math.random() * 900000000);

      await db.query(
        `INSERT INTO payments 
          (payment_id, booking_id, customer_id, amount, payment_method, payment_date, status, transaction_reference)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [pId, b.bId, b.customerId, b.estCost, method, b.bookingDate, pStatus, txnRef]
      );
    }
    console.log('25 Payments seeded.');

    console.log('🎉 AutoCare Pro MySQL Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal Error seeding database:', error);
    process.exit(1);
  }
}

seed();
