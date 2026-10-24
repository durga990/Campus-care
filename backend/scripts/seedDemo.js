import 'dotenv/config';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import ComplaintComment from '../models/ComplaintComment.js';
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import Counter from '../models/Counter.js';

async function seed() {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Complaint.deleteMany({}),
      ComplaintHistory.deleteMany({}),
      ComplaintComment.deleteMany({}),
      Feedback.deleteMany({}),
      Notification.deleteMany({}),
      Counter.deleteMany({})
    ]);

    console.log('Seeding users...');
    const admin = await User.create({ name: 'System Admin', email: 'admin@campuscare.edu', password: 'Admin@1234', role: 'admin', department: 'Campus Administration', isActive: true });
    const staffElectrical  = await User.create({ name: 'Arjun Krishnamurthy',    email: 'arjun.krishnamurthy@campuscare.edu',    password: 'Staff@1234', phone: '9876541001', role: 'staff', department: 'Electrical',         isActive: true });
    const staffPlumbing    = await User.create({ name: 'Murugan Selvam',          email: 'murugan.selvam@campuscare.edu',          password: 'Staff@1234', phone: '9876541002', role: 'staff', department: 'Plumbing',           isActive: true });
    const staffCarpentry   = await User.create({ name: 'Venkatesh Naidu',         email: 'venkatesh.naidu@campuscare.edu',         password: 'Staff@1234', phone: '9876541003', role: 'staff', department: 'Carpentry',          isActive: true });
    const staffInfra       = await User.create({ name: 'Suresh Babu Reddy',       email: 'suresh.reddy@campuscare.edu',            password: 'Staff@1234', phone: '9876541004', role: 'staff', department: 'Infrastructure',     isActive: true });
    const staffComputerLab = await User.create({ name: 'Karthikeyan Subramanian', email: 'karthikeyan.subramanian@campuscare.edu', password: 'Staff@1234', phone: '9876541005', role: 'staff', department: 'Computer Lab',       isActive: true });
    const staffHostel      = await User.create({ name: 'Annamalai Rajan',         email: 'annamalai.rajan@campuscare.edu',         password: 'Staff@1234', phone: '9876541006', role: 'staff', department: 'Hostel & Facilities', isActive: true });
    const staffCleanliness = await User.create({ name: 'Ponniammal Devi',         email: 'ponniammal.devi@campuscare.edu',         password: 'Staff@1234', phone: '9876541007', role: 'staff', department: 'Cleanliness',        isActive: true });
    const student          = await User.create({ name: 'Priya Lakshmi', email: 'priya.lakshmi@campuscare.edu', password: 'Student@1234', studentId: 'STD-2024-101', phone: '9876542001', role: 'student', department: 'Computer Science', year: '2nd Year', section: 'Section A', isActive: true });

    console.log('Seeding complaints...');
    const yr = new Date().getFullYear();
    await Counter.create({ _id: `complaint-${yr}`, seq: 3 });

    const c1 = await Complaint.create({ complaintId: `CMP-${yr}-000001`, title: 'Lab 3 workstations losing network connection', description: 'Computers in Lab 3 intermittently drop from the campus network.', category: 'Computer Lab', priority: 'High', location: 'Academic Block B, Lab 3', status: 'IN_PROGRESS', submittedBy: student._id, assignedTo: staffComputerLab._id, department: 'Computer Lab' });
    await ComplaintHistory.create({ complaint: c1._id, performedBy: student._id, action: 'Complaint Created', newStatus: 'SUBMITTED', message: 'Network issue reported.' });
    await ComplaintHistory.create({ complaint: c1._id, performedBy: admin._id, action: 'Assigned to Staff Member', previousStatus: 'SUBMITTED', newStatus: 'ASSIGNED', message: `Assigned to ${staffComputerLab.name} (Computer Lab)` });
    await ComplaintHistory.create({ complaint: c1._id, performedBy: staffComputerLab._id, action: 'Work Started', previousStatus: 'ASSIGNED', newStatus: 'IN_PROGRESS', message: 'Identified faulty switch port; replacement in progress.' });

    const resolvedDate = new Date(); resolvedDate.setHours(resolvedDate.getHours() - 10);
    const c2 = await Complaint.create({ complaintId: `CMP-${yr}-000002`, title: 'Broken handrail on Block A staircase', description: 'Handrail between floors 1 and 2 is loose — safety hazard.', category: 'Infrastructure', priority: 'Urgent', location: 'Academic Block A, Stairwell Floor 1', status: 'RESOLVED', submittedBy: student._id, assignedTo: staffInfra._id, department: 'Infrastructure', resolvedAt: resolvedDate });
    await ComplaintHistory.create({ complaint: c2._id, performedBy: student._id, action: 'Complaint Created', newStatus: 'SUBMITTED', message: 'Safety hazard reported.' });
    await ComplaintHistory.create({ complaint: c2._id, performedBy: staffInfra._id, action: 'Resolution Submitted', previousStatus: 'IN_PROGRESS', newStatus: 'RESOLVED', message: 'Handrail re-anchored and inspected.' });
    await Feedback.create({ complaint: c2._id, student: student._id, rating: 5, comment: 'Fixed quickly. Thank you!' });

    const c3 = await Complaint.create({ complaintId: `CMP-${yr}-000003`, title: 'Leaking tap in Hostel Block 1 washroom', description: 'Washroom tap on ground floor has been dripping for two days.', category: 'Plumbing', priority: 'Medium', location: 'Hostel Block 1 (Boys), Ground Floor Washroom', status: 'ASSIGNED', submittedBy: student._id, assignedTo: staffPlumbing._id, department: 'Plumbing' });
    await ComplaintHistory.create({ complaint: c3._id, performedBy: student._id, action: 'Complaint Created', newStatus: 'SUBMITTED', message: 'Leaking tap needs repair.' });
    await ComplaintHistory.create({ complaint: c3._id, performedBy: admin._id, action: 'Assigned to Staff Member', previousStatus: 'SUBMITTED', newStatus: 'ASSIGNED', message: `Assigned to ${staffPlumbing.name} (Plumbing)` });

    await Notification.create([
      { recipient: student._id, title: 'Work started on your complaint', message: `${staffComputerLab.name} started work on ${c1.complaintId}.`, type: 'status', relatedComplaint: c1._id, isRead: false },
      { recipient: student._id, title: 'Complaint marked as resolved',   message: `${c2.complaintId} has been resolved. Please rate the service.`, type: 'status', relatedComplaint: c2._id, isRead: false },
      { recipient: staffComputerLab._id, title: 'New assignment', message: `${c1.complaintId} (High priority) was assigned to you.`, type: 'assigned', relatedComplaint: c1._id, isRead: false },
      { recipient: staffPlumbing._id,    title: 'New assignment', message: `${c3.complaintId} (Medium priority) was assigned to you.`, type: 'assigned', relatedComplaint: c3._id, isRead: false },
      { recipient: admin._id, title: 'Urgent complaint submitted', message: `${student.name} submitted ${c2.complaintId} (Urgent).`, type: 'new_complaint', relatedComplaint: c2._id, isRead: false }
    ]);

    console.log('\n=== SEED COMPLETE ===');
    console.log('\nADMIN');
    console.log('  admin@campuscare.edu                    | Admin@1234');
    console.log('\nSTUDENT');
    console.log('  priya.lakshmi@campuscare.edu            | Student@1234');
    console.log('\nSTAFF  (all passwords: Staff@1234)');
    console.log('  arjun.krishnamurthy@campuscare.edu      | Electrical');
    console.log('  murugan.selvam@campuscare.edu           | Plumbing');
    console.log('  venkatesh.naidu@campuscare.edu          | Carpentry');
    console.log('  suresh.reddy@campuscare.edu             | Infrastructure');
    console.log('  karthikeyan.subramanian@campuscare.edu  | Computer Lab');
    console.log('  annamalai.rajan@campuscare.edu          | Hostel & Facilities');
    console.log('  ponniammal.devi@campuscare.edu          | Cleanliness');
    console.log('\n=====================\n');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
}

seed();
