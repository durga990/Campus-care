import Notification from '../models/Notification.js';
import User from '../models/User.js';

export async function notify(recipientIds, { title, message, type = 'info', complaint }) {
  const ids = [...new Set(recipientIds.filter(Boolean).map(String))];
  if (!ids.length) return;
  await Notification.insertMany(ids.map((recipient) => ({ recipient, title, message, type, relatedComplaint: complaint })));
}
export const adminIds = async () => (await User.find({ role: 'admin', isActive: true }).select('_id')).map((u) => u._id);
