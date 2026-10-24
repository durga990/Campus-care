export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) return next(result.error);
  if (source === 'query') { req.validatedQuery = result.data; } else { req[source] = result.data; }
  next();
};
