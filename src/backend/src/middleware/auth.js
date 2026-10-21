const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

const auth = (roles) => (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET);
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (
      roles &&
      !allowedRoles.includes(decoded.role) &&
      decoded.role !== "ADMIN"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
module.exports = { auth, SECRET };
