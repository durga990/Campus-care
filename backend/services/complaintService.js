import Complaint from '../models/Complaint.js';
import Counter from '../models/Counter.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import ComplaintComment from '../models/ComplaintComment.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { ApiError, escapeRegex } from '../utils/http.js';
import { notify, adminIds } from './notificationService.js';

const LABEL = { SUBMITTED: 'Submitted', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed', REJECTED: 'Rejected' };
const TERMINAL = ['CLOSED', 'REJECTED'];
const TRANSITIONS = {
  student: { RESOLVED: ['CLOSED', 'IN_PROGRESS'], CLOSED: ['IN_PROGRESS'] },
  staff: {
    ASSIGNED: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    IN_PROGRESS: ['RESOLVED', 'CLOSED'],
    RESOLVED: ['CLOSED']
  }
};
const SORTS = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, updated: { updatedAt: -1 }, priority: { priorityRank: -1, createdAt: -1 } };
const PRIORITY_RANK = { Low: 1, Medium: 2, High: 3, Urgent: 4 };

const same = (a, b) => a && b && String(a._id || a) === String(b._id || b);
const toAttachments = (files = [], user, kind = 'evidence') =>
  files.map((f) => ({ url: `/uploads/${f.filename}`, originalName: f.originalname, mimeType: f.mimetype, size: f.size, kind, uploadedBy: user._id }));

async function nextComplaintId() {
  const year = new Date().getFullYear();
  const c = await Counter.findOneAndUpdate({ _id: `complaint-${year}` }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return `CMP-${year}-${String(c.seq).padStart(6, '0')}`;
}
const log = (complaint, user, action, extra = {}) =>
  ComplaintHistory.create({ complaint: complaint._id, performedBy: user._id, action, ...extra });

export function mapCategoryToDepartment(category, subCategory) {
  const cat = (category || '').toLowerCase();
  const sub = (subCategory || '').toLowerCase();
  const text = `${cat} ${sub}`;

  if (text.includes('plumb') || text.includes('sewerage') || text.includes('drain') || (text.includes('water cooler') && text.includes('plumb'))) {
    return 'Plumbing';
  }
  if (text.includes('electric') || text.includes('air conditioner') || text.includes('energy meter') || text.includes('cooling') || text.includes('lift')) {
    return 'Electrical';
  }
  if (text.includes('carpentr') || text.includes('wood') || text.includes('furniture') || text.includes('door') || text.includes('window')) {
    return 'Carpentry';
  }
  if (text.includes('mason') || text.includes('welder') || text.includes('marking') || text.includes('civil') || text.includes('paint') || text.includes('infrastruct')) {
    return 'Infrastructure';
  }
  if (text.includes('ai') || text.includes('computer') || text.includes('wi-fi') || text.includes('internet') || text.includes('network') || text.includes('hardware') || text.includes('lab')) {
    return 'Computer Lab';
  }
  if (text.includes('tailor') || text.includes('hostel') || text.includes('room') || text.includes('mess')) {
    return 'Hostel & Facilities';
  }
  if (text.includes('clean') || text.includes('washroom') || text.includes('sweep') || text.includes('garbage')) {
    return 'Cleanliness';
  }
  return 'Infrastructure';
}

export async function autoAssignStaff(targetDept) {
  const keyword = (targetDept || '').split(/[\s&/]+/)[0];
  let candidates = await User.find({
    role: 'staff',
    isActive: true,
    department: { $regex: new RegExp(keyword, 'i') }
  });

  if (!candidates.length) {
    candidates = await User.find({ role: 'staff', isActive: true });
  }

  if (!candidates.length) return null;
  if (candidates.length === 1) return candidates[0];

  const candidateIds = candidates.map((c) => c._id);
  const workloads = await Complaint.aggregate([
    { $match: { assignedTo: { $in: candidateIds }, status: { $nin: ['CLOSED', 'REJECTED'] } } },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
  ]);
  const countMap = new Map(workloads.map((w) => [String(w._id), w.count]));
  candidates.sort((a, b) => (countMap.get(String(a._id)) || 0) - (countMap.get(String(b._id)) || 0));
  return candidates[0];
}

export function assertAccess(user, c) {
  const ok = user.role === 'admin' || (user.role === 'student' && same(c.submittedBy, user)) || (user.role === 'staff' && same(c.assignedTo, user));
  if (!ok) throw new ApiError(403, 'You do not have access to this complaint.');
}
async function loadComplaint(id) {
  const c = await Complaint.findById(id);
  if (!c) throw new ApiError(404, 'Complaint not found.');
  return c;
}

export async function createComplaint(user, data, files) {
  const title = data.title?.trim() || `${data.messageType || 'Grievance'}: ${data.category}${data.subCategory ? ' - ' + data.subCategory : ''}`;
  const location = data.location?.trim() || [
    data.block,
    data.subBlock,
    data.roomNo ? (data.roomType === 'Room No' ? `Room ${data.roomNo}` : data.roomNo) : null
  ].filter(Boolean).join(', ') || 'Campus Area';

  const targetDept = mapCategoryToDepartment(data.category, data.subCategory);
  const assignedStaff = await autoAssignStaff(targetDept);
  const complaintDept = assignedStaff?.department || targetDept;
  const initialStatus = assignedStaff ? 'ASSIGNED' : 'SUBMITTED';

  const timeSlot = Array.isArray(data.timeSlot) ? data.timeSlot : (data.timeSlot ? [data.timeSlot] : []);

  const complaint = await Complaint.create({
    ...data,
    title,
    location,
    timeSlot,
    complaintId: await nextComplaintId(),
    submittedBy: user._id,
    assignedTo: assignedStaff?._id || null,
    department: complaintDept,
    status: initialStatus,
    attachments: toAttachments(files, user)
  });

  await log(complaint, user, 'Complaint Created', {
    newStatus: initialStatus,
    message: assignedStaff
      ? `Complaint auto-assigned to ${assignedStaff.name} (${complaintDept}).`
      : `Complaint submitted to ${complaintDept} queue.`
  });

  const admins = await adminIds();
  if (assignedStaff) {
    await notify([user._id], {
      title: 'Complaint auto-assigned to staff',
      message: `Your complaint ${complaint.complaintId} (${data.category}) was auto-assigned to ${assignedStaff.name} (${complaintDept}).`,
      type: 'assigned',
      complaint: complaint._id
    });
    await notify([assignedStaff._id], {
      title: 'New complaint assigned to you',
      message: `${complaint.complaintId} (${complaint.priority} priority) at ${location} was assigned to you.`,
      type: 'assigned',
      complaint: complaint._id
    });
    await notify(admins, {
      title: 'New complaint auto-assigned',
      message: `${user.name} submitted ${complaint.complaintId}, auto-assigned to ${assignedStaff.name} (${complaintDept}).`,
      type: 'new_complaint',
      complaint: complaint._id
    });
  } else {
    await notify([user._id], {
      title: 'Complaint submitted',
      message: `Your complaint ${complaint.complaintId} has been submitted to the ${complaintDept} queue.`,
      type: 'submitted',
      complaint: complaint._id
    });
    await notify(admins, {
      title: 'New unassigned complaint',
      message: `${user.name} submitted ${complaint.complaintId} in ${complaintDept} (awaiting staff assignment).`,
      type: 'new_complaint',
      complaint: complaint._id
    });
  }

  return complaint;
}

export async function listComplaints(user, q) {
  const filter = {};
  if (user.role === 'student') filter.submittedBy = user._id;
  if (user.role === 'staff') filter.assignedTo = user._id;
  for (const k of ['status', 'category', 'priority']) if (q[k]) filter[k] = q[k];
  if (q.department && user.role === 'admin') filter.department = q.department;
  if (q.from || q.to) {
    filter.createdAt = {};
    if (q.from) filter.createdAt.$gte = new Date(q.from);
    if (q.to) { const t = new Date(q.to); t.setHours(23, 59, 59, 999); filter.createdAt.$lte = t; }
  }
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), 'i');
    filter.$or = [{ title: rx }, { complaintId: rx }, { description: rx }, { location: rx }];
  }
  const skip = (q.page - 1) * q.limit;
  let query;
  if (q.sort === 'priority') {
    const pipeline = [{ $match: filter },
      { $addFields: { priorityRank: { $switch: { branches: Object.entries(PRIORITY_RANK).map(([k, v]) => ({ case: { $eq: ['$priority', k] }, then: v })), default: 0 } } } },
      { $sort: SORTS.priority }, { $skip: skip }, { $limit: q.limit }];
    const [raw, total] = await Promise.all([Complaint.aggregate(pipeline), Complaint.countDocuments(filter)]);
    const items = await Complaint.populate(raw, [{ path: 'submittedBy', select: 'name studentId department' }, { path: 'assignedTo', select: 'name department' }]);
    return { items, total, page: q.page, pages: Math.ceil(total / q.limit) };
  }
  query = Complaint.find(filter).sort(SORTS[q.sort]).skip(skip).limit(q.limit)
    .populate('submittedBy', 'name studentId department').populate('assignedTo', 'name department').select('-comments').lean();
  const [items, total] = await Promise.all([query, Complaint.countDocuments(filter)]);
  return { items, total, page: q.page, pages: Math.ceil(total / q.limit) };
}

export async function getComplaintDetail(user, id) {
  const c = await Complaint.findById(id)
    .populate('submittedBy', 'name studentId email phone department year section')
    .populate('assignedTo', 'name email department').populate('attachments.uploadedBy', 'name role');
  if (!c) throw new ApiError(404, 'Complaint not found.');
  assertAccess(user, c);
  const [history, comments, feedback] = await Promise.all([
    ComplaintHistory.find({ complaint: c._id }).sort({ timestamp: 1 }).populate('performedBy', 'name role').lean(),
    ComplaintComment.find({ complaint: c._id }).sort({ createdAt: 1 }).populate('author', 'name role').lean(),
    Feedback.findOne({ complaint: c._id }).lean()
  ]);
  return { complaint: c, history, comments, feedback };
}

export async function updateComplaint(user, id, data) {
  const c = await loadComplaint(id);
  const changes = [];
  for (const k of Object.keys(data)) if (data[k] !== c[k]) { changes.push(`${k}: ${c[k] ?? '—'} → ${data[k]}`); c[k] = data[k]; }
  if (!changes.length) return c;
  await c.save();
  await log(c, user, 'Details Updated', { message: changes.join('; ') });
  await notify([c.submittedBy], { title: 'Complaint updated', message: `${c.complaintId} was updated (${changes.join('; ')}).`, type: 'updated', complaint: c._id });
  return c;
}

export async function assignComplaint(user, id, { staffId, department, note }) {
  const c = await loadComplaint(id);
  if (TERMINAL.includes(c.status)) throw new ApiError(400, `A ${LABEL[c.status].toLowerCase()} complaint cannot be assigned.`);
  const staff = await User.findOne({ _id: staffId, role: 'staff', isActive: true });
  if (!staff) throw new ApiError(400, 'Selected staff member was not found or is inactive.');
  const prev = c.status;
  c.assignedTo = staff._id; c.status = 'ASSIGNED'; c.department = department || staff.department || c.department;
  c.resolvedAt = undefined;
  await c.save();
  await log(c, user, 'Assigned to Staff Member', { previousStatus: prev, newStatus: 'ASSIGNED', message: `Assigned to ${staff.name}${c.department ? ` (${c.department})` : ''}.${note ? ' ' + note : ''}` });
  await notify([c.submittedBy], { title: 'Complaint assigned', message: `Your complaint ${c.complaintId} has been assigned to ${c.department || 'a staff member'}.`, type: 'assigned', complaint: c._id });
  await notify([staff._id], { title: 'New assignment', message: `${c.complaintId} (${c.priority}) was assigned to you.`, type: 'assigned', complaint: c._id });
  return c;
}

export async function changeStatus(user, id, status, message, files = []) {
  const c = await loadComplaint(id);
  assertAccess(user, c);
  if (status === c.status) throw new ApiError(400, 'Complaint is already in that status.');
  if (user.role === 'admin') {
    if (TERMINAL.includes(c.status)) throw new ApiError(400, 'This complaint is already finalised.');
    if (!['IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].includes(status)) throw new ApiError(400, 'Use the assign action to assign a complaint.');
    if (['IN_PROGRESS', 'RESOLVED'].includes(status) && !c.assignedTo) throw new ApiError(400, 'Assign a staff member first.');
  } else if (!TRANSITIONS[user.role]?.[c.status]?.includes(status)) {
    throw new ApiError(400, `You cannot change a complaint from ${LABEL[c.status]} to ${LABEL[status]}.`);
  }
  if (status === 'REJECTED' && !message) throw new ApiError(400, 'Please provide a reason for rejecting.');
  const prev = c.status, reopened = prev === 'RESOLVED' && status === 'IN_PROGRESS';
  c.status = status;
  if (status === 'RESOLVED') c.resolvedAt = new Date();
  if (reopened) c.resolvedAt = undefined;
  if (status === 'CLOSED') { c.closedAt = new Date(); c.resolvedAt = c.resolvedAt || c.closedAt; }
  if (files.length) c.attachments.push(...toAttachments(files, user, status === 'RESOLVED' ? 'resolution' : 'evidence'));
  await c.save();
  const action = reopened ? 'Complaint Reopened' : { IN_PROGRESS: 'Work Started', RESOLVED: 'Resolution Submitted', CLOSED: user.role === 'student' ? 'Student Closed Complaint' : 'Complaint Closed', REJECTED: 'Complaint Rejected' }[status];
  await log(c, user, action, { previousStatus: prev, newStatus: status, message });
  const admins = await adminIds();
  const text = { IN_PROGRESS: reopened ? 'was reopened' : 'is now In Progress', RESOLVED: 'has been marked as resolved', CLOSED: 'has been closed', REJECTED: 'was rejected' }[status];
  await notify([c.submittedBy], { title: `Complaint ${LABEL[status].toLowerCase()}`, message: `Your complaint ${c.complaintId} ${text}.`, type: 'status', complaint: c._id });
  await notify([c.assignedTo, ...admins].filter((x) => !same(x, user)), { title: 'Status update', message: `${c.complaintId} ${text} (by ${user.name}).`, type: 'status', complaint: c._id });
  return c;
}

export async function addComment(user, id, message) {
  const c = await loadComplaint(id);
  assertAccess(user, c);
  const comment = await ComplaintComment.create({ complaint: c._id, author: user._id, message });
  c.comments.push(comment._id); await c.save();
  const admins = await adminIds();
  await notify([c.submittedBy, c.assignedTo, ...admins].filter((x) => x && !same(x, user)), { title: 'New comment', message: `${user.name} commented on ${c.complaintId}.`, type: 'comment', complaint: c._id });
  return comment.populate('author', 'name role');
}

export async function addAttachments(user, id, files) {
  if (!files?.length) throw new ApiError(400, 'Please choose at least one image.');
  const c = await loadComplaint(id);
  assertAccess(user, c);
  if (TERMINAL.includes(c.status)) throw new ApiError(400, 'Evidence cannot be added to a finalised complaint.');
  c.attachments.push(...toAttachments(files, user, user.role === 'staff' ? 'resolution' : 'evidence'));
  await c.save();
  await log(c, user, 'Evidence Uploaded', { message: `${files.length} file(s) uploaded.` });
  return c;
}

export async function deleteComplaint(id) {
  const c = await loadComplaint(id);
  await Promise.all([ComplaintHistory.deleteMany({ complaint: c._id }), ComplaintComment.deleteMany({ complaint: c._id }), Feedback.deleteMany({ complaint: c._id }), c.deleteOne()]);
}
