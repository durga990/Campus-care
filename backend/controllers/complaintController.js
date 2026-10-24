import * as svc from '../services/complaintService.js';
import { asyncHandler, ok } from '../utils/http.js';

export const create = asyncHandler(async (req, res) => ok(res, { complaint: await svc.createComplaint(req.user, req.body, req.files) }, 'Complaint submitted.', 201));
export const list = asyncHandler(async (req, res) => ok(res, await svc.listComplaints(req.user, req.validatedQuery)));
export const detail = asyncHandler(async (req, res) => ok(res, await svc.getComplaintDetail(req.user, req.params.id)));
export const update = asyncHandler(async (req, res) => ok(res, { complaint: await svc.updateComplaint(req.user, req.params.id, req.body) }, 'Complaint updated.'));
export const assign = asyncHandler(async (req, res) => ok(res, { complaint: await svc.assignComplaint(req.user, req.params.id, req.body) }, 'Complaint assigned.'));
export const status = asyncHandler(async (req, res) => ok(res, { complaint: await svc.changeStatus(req.user, req.params.id, req.body.status, req.body.message, req.files) }, 'Status updated.'));
export const comment = asyncHandler(async (req, res) => ok(res, { comment: await svc.addComment(req.user, req.params.id, req.body.message) }, 'Comment added.', 201));
export const attachments = asyncHandler(async (req, res) => ok(res, { complaint: await svc.addAttachments(req.user, req.params.id, req.files) }, 'Files uploaded.'));
export const remove = asyncHandler(async (req, res) => { await svc.deleteComplaint(req.params.id); ok(res, {}, 'Complaint deleted.'); });
