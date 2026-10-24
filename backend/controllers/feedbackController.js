import Complaint from '../models/Complaint.js';
import Feedback from '../models/Feedback.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import { ApiError, asyncHandler, ok } from '../utils/http.js';
import { notify, adminIds } from '../services/notificationService.js';

export const create = asyncHandler(async (req, res) => {
  const { complaintId, rating, comment } = req.body;
  const c = await Complaint.findById(complaintId);
  if (!c || String(c.submittedBy) !== String(req.user._id)) throw new ApiError(404, 'Complaint not found.');
  if (!['RESOLVED', 'CLOSED'].includes(c.status)) throw new ApiError(400, 'Feedback can be given once the complaint is resolved.');
  if (await Feedback.exists({ complaint: c._id })) throw new ApiError(409, 'Feedback has already been submitted for this complaint.');
  const feedback = await Feedback.create({ complaint: c._id, student: req.user._id, rating, comment });
  await ComplaintHistory.create({ complaint: c._id, action: 'Feedback Submitted', performedBy: req.user._id, message: `Rated ${rating}/5.` });
  const admins = await adminIds();
  await notify([c.assignedTo, ...admins].filter(Boolean), {
    title: 'Student feedback received',
    message: `${c.complaintId} received a ${rating}/5 star rating${comment ? ': "' + comment + '"' : ''}.`,
    type: 'feedback',
    complaint: c._id
  });
  ok(res, { feedback }, 'Thank you for your feedback.', 201);
});
