const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET || "rahasia";

const authenticate = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (_err) {
    res.status(401).json({ message: "Token tidak valid" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.length) {
    return next();
  }

  const userRole = req.user?.role;
  if (!userRole) {
    return next();
  }

  if (!roles.includes(userRole)) {
    return res.status(403).json({ message: "Akses ditolak" });
  }

  next();
};

const middleware = (req, res, next) => authenticate(req, res, next);
middleware.authenticate = authenticate;
middleware.requireRole = requireRole;

module.exports = middleware;
