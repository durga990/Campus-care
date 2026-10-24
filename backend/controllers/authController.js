import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncHandler, ok } from '../utils/http.js';

const sign = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const register = asyncHandler(async (req, res) => {
  const allowedRoles = ['student', 'staff'];
  const role = allowedRoles.includes(req.body.role) ? req.body.role : 'student';

  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new ApiError(409, 'An account with this email address already exists.');

  if (role === 'student' && req.body.studentId) {
    const existingStudentId = await User.findOne({ studentId: req.body.studentId.toUpperCase() });
    if (existingStudentId) throw new ApiError(409, 'This student ID is already registered.');
  }

  const payload = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    role,
    department: req.body.department,
    ...(role === 'student' ? {
      studentId: req.body.studentId?.toUpperCase(),
      year: req.body.year,
      section: req.body.section
    } : {})
  };

  const user = await User.create(payload);
  ok(res, { user, token: sign(user) }, `${role === 'staff' ? 'Staff' : 'Student'} registration successful.`, 201);
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (req.body.role && user.role !== req.body.role) {
    const roleLabels = { student: 'Student', staff: 'Staff', admin: 'Administrator' };
    const selectedLabel = roleLabels[req.body.role] || req.body.role;
    const actualLabel = roleLabels[user.role] || user.role;
    throw new ApiError(403, `Access denied for ${selectedLabel} login. This account is registered as ${actualLabel}.`);
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact the administrator.');
  }
  ok(res, { user, token: sign(user) }, 'Login successful.');
});

export const me = asyncHandler(async (req, res) => ok(res, { user: req.user }));
// JWT is stateless; the client discards the token. Endpoint exists for a uniform API.
export const logout = (_req, res) => ok(res, {}, 'Logged out.');
