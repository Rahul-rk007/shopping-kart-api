
const jwt = require("jsonwebtoken");

const verifyAdminToken = (req, res, next) => {
  
  const token = req.headers["authorization"];
  if (!token) return res.status(403).send("A token is required for authentication");

  jwt.verify(token, process.env.JWT_ADMIN_SECRET, (err, decoded) => {
    if (err) return res.status(401).send("Invalid Token");
    req.adminId = decoded.id;
    next();
  });
};

module.exports = verifyAdminToken;
