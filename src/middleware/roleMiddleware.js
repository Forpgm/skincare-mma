const jwt = require("jsonwebtoken");

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const token =
        req.headers.authorization && req.headers.authorization.split(" ")[1];
      console.log("token", token);

      if (!token) {
        return res.status(401).send({ message: "Missing token!" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).send({
          message:
            "Access denied. You do not have permission to access this resource.",
        });
      }

      next(); // Nếu có quyền truy cập, tiếp tục tới route
    } catch (error) {
      console.error("Error in roleMiddleware:", error);
      return res.status(400).send({ message: "Invalid token." });
    }
  };
};

module.exports = roleMiddleware;
