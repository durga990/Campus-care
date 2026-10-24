import Notification from '../models/Notification.js';
import { ApiError, asyncHandler, ok } from '../utils/http.js';

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1), limit = Math.min(50, parseInt(req.query.limit) || 20);
  const filter = { recipient: req.user._id };
  const [items, total, unread] = await Promise.all([
    Notification.find(filter)
      .populate('relatedComplaint', 'complaintId title status priority')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false })
  ]);
  ok(res, { items, total, unread, page, pages: Math.ceil(total / limit) });
});
export const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true }, { new: true });
  if (!n) throw new ApiError(404, 'Notification not found.');
  ok(res, { notification: n });
});
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  ok(res, {}, 'All notifications marked as read.');
});
