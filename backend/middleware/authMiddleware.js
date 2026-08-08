/**
 * Auth Middleware — decodes a base64 bearer token containing { id, email, role, name }
 * This is a lightweight dev-mode token system. In production, replace with JWT verification.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    req.user = decoded; // { id, email, role, name, site }
  } catch {
    req.user = null;
  }
  next();
};

module.exports = authMiddleware;
