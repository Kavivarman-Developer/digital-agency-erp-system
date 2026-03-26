const jwt = require("jsonwebtoken");

// ✅ Verify Token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store user data
    next();
  } catch (err) {
    res.status(401).json("Invalid token");
  }
};

// ✅ Role-Based Access
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json("Access denied");
    }
    next();
  };
};