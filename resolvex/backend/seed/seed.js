/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Complaint = require('../src/models/Complaint');
const Feedback = require('../src/models/Feedback');
const Notification = require('../src/models/Notification');
const ActivityLog = require('../src/models/ActivityLog');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Complaint.deleteMany({}),
    Feedback.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  console.log('Creating departments...');
  const departments = await Department.create([
    { name: 'Electrical & Maintenance', categories: ['Electrical', 'Water Supply'], description: 'Handles electrical faults and water supply issues across campus.' },
    { name: 'IT & Networking', categories: ['Internet'], description: 'Manages campus WiFi, LAN, and computer lab connectivity.' },
    { name: 'Civil & Plumbing', categories: ['Plumbing', 'Classroom', 'Laboratory'], description: 'Handles plumbing, classroom, and lab infrastructure.' },
    { name: 'Hostel Administration', categories: ['Hostel'], description: 'Manages hostel facilities and resident complaints.' },
    { name: 'Library Services', categories: ['Library'], description: 'Handles library resources and facility issues.' },
    { name: 'Security Office', categories: ['Security'], description: 'Campus security and safety concerns.' },
    { name: 'Housekeeping', categories: ['Cleanliness'], description: 'Cleanliness and sanitation across campus.' },
    { name: 'Sports Department', categories: ['Sports'], description: 'Sports facilities and equipment.' },
    { name: 'General Administration', categories: ['Others'], description: 'Miscellaneous complaints not covered elsewhere.' },
  ]);

  const deptByName = Object.fromEntries(departments.map((d) => [d.name, d]));

  console.log('Creating demo users...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@resolvex.edu',
    password: 'Admin@1234',
    role: 'admin',
    isEmailVerified: true,
    phone: '9999900000',
  });

  const staff1 = await User.create({
    name: 'Ramesh Kumar',
    email: 'staff.electrical@resolvex.edu',
    password: 'Staff@1234',
    role: 'staff',
    department: deptByName['Electrical & Maintenance']._id,
    isEmailVerified: true,
    employeeId: 'EMP-1001',
  });

  const staff2 = await User.create({
    name: 'Priya Sharma',
    email: 'staff.it@resolvex.edu',
    password: 'Staff@1234',
    role: 'staff',
    department: deptByName['IT & Networking']._id,
    isEmailVerified: true,
    employeeId: 'EMP-1002',
  });

  await Department.findByIdAndUpdate(deptByName['Electrical & Maintenance']._id, { head: staff1._id });
  await Department.findByIdAndUpdate(deptByName['IT & Networking']._id, { head: staff2._id });

  const faculty = await User.create({
    name: 'Dr. Anjali Verma',
    email: 'faculty@resolvex.edu',
    password: 'Faculty@1234',
    role: 'faculty',
    isEmailVerified: true,
    employeeId: 'FAC-2001',
  });

  const student1 = await User.create({
    name: 'Rahul Singh',
    email: 'student@resolvex.edu',
    password: 'Student@1234',
    role: 'student',
    isEmailVerified: true,
    studentId: 'STU-3001',
    phone: '9876543210',
  });

  const student2 = await User.create({
    name: 'Sneha Patel',
    email: 'sneha.patel@resolvex.edu',
    password: 'Student@1234',
    role: 'student',
    isEmailVerified: true,
    studentId: 'STU-3002',
  });

  console.log('Creating sample complaints...');
  const complaintsData = [
    {
      title: 'Flickering lights in Room 204',
      description: 'The tube lights in classroom 204 keep flickering, making it hard to read the whiteboard.',
      category: 'Electrical',
      location: 'Academic Block A, Room 204',
      status: 'Resolved',
      submittedBy: student1._id,
      department: deptByName['Electrical & Maintenance']._id,
      assignedTo: staff1._id,
    },
    {
      title: 'WiFi not working in hostel block C',
      description: 'No internet connectivity in Hostel Block C since yesterday evening.',
      category: 'Internet',
      location: 'Hostel Block C',
      status: 'In Progress',
      submittedBy: student1._id,
      department: deptByName['IT & Networking']._id,
      assignedTo: staff2._id,
    },
    {
      title: 'Leaking tap in chemistry lab',
      description: 'The wash basin tap in the chemistry lab is leaking continuously and wasting water.',
      category: 'Laboratory',
      location: 'Science Block, Chemistry Lab 2',
      status: 'Pending',
      submittedBy: faculty._id,
      department: deptByName['Civil & Plumbing']._id,
    },
    {
      title: 'Broken chair in library reading hall',
      description: 'Several chairs in the reading hall have broken armrests and are unsafe to use.',
      category: 'Library',
      location: 'Central Library, Reading Hall',
      status: 'Assigned',
      submittedBy: student2._id,
      department: deptByName['Library Services']._id,
    },
    {
      title: 'Garbage not collected near canteen',
      description: 'Garbage bins near the canteen have not been emptied for three days and are overflowing.',
      category: 'Cleanliness',
      location: 'Main Canteen Area',
      status: 'Closed',
      submittedBy: student2._id,
      department: deptByName['Housekeeping']._id,
    },
  ];

  const complaints = [];
  for (const data of complaintsData) {
    const complaint = new Complaint({
      ...data,
      timeline: [{ status: 'Pending', note: 'Complaint submitted', changedBy: data.submittedBy }],
    });
    if (data.status !== 'Pending') {
      complaint.timeline.push({ status: 'Assigned', note: 'Assigned to department staff', changedBy: admin._id });
      complaint.assignedBy = admin._id;
      complaint.assignedAt = new Date();
    }
    if (['In Progress', 'Resolved', 'Closed'].includes(data.status)) {
      complaint.timeline.push({ status: 'In Progress', note: 'Work started', changedBy: data.assignedTo || admin._id });
    }
    if (['Resolved', 'Closed'].includes(data.status)) {
      complaint.timeline.push({ status: 'Resolved', note: 'Issue fixed', changedBy: data.assignedTo || admin._id });
      complaint.resolvedAt = new Date();
      complaint.resolutionRemarks = 'Issue has been fixed and verified.';
    }
    if (data.status === 'Closed') {
      complaint.timeline.push({ status: 'Closed', note: 'Confirmed by complainant', changedBy: data.submittedBy });
      complaint.closedAt = new Date();
    }
    await complaint.save();
    complaints.push(complaint);
  }

  console.log('Creating sample feedback...');
  const closedComplaint = complaints.find((c) => c.status === 'Closed');
  if (closedComplaint) {
    await Feedback.create({
      complaint: closedComplaint._id,
      submittedBy: closedComplaint.submittedBy,
      rating: 5,
      comment: 'Quick response and the issue was resolved well. Thank you!',
    });
    closedComplaint.isFeedbackGiven = true;
    await closedComplaint.save();
  }

  console.log('\n Seed complete!\n');
  console.log('Demo accounts (all emails verified):');
  console.log('  Admin    -> admin@resolvex.edu / Admin@1234');
  console.log('  Staff    -> staff.electrical@resolvex.edu / Staff@1234');
  console.log('  Staff    -> staff.it@resolvex.edu / Staff@1234');
  console.log('  Faculty  -> faculty@resolvex.edu / Faculty@1234');
  console.log('  Student  -> student@resolvex.edu / Student@1234');
  console.log('  Student  -> sneha.patel@resolvex.edu / Student@1234\n');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
