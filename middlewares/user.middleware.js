var jwt = require("jsonwebtoken");
const authMiddleware = (...roleAllowed) => {
  let decoded;
  return async (req, res, next) => {
    try {
      const token = req.headers?.authorization?.split(" ")[1];
      if (!token) {
        res.status(404).json({ message: "Token not found" });
        return;
      }
      decoded = jwt.verify(token, "shhhhh");
    } catch (err) {
      if (err.message == "jwt expired") {
        let refreshToken = req.headers?.refreshtoken?.split(" ")[1];
        if (!refreshToken) {
          res.status(404).json({ message: "Token not found please login" });
          return;
        } else {
          let refreshDecode = jwt.verify(refreshToken, "shhhhh");
          let newAccesstoken = jwt.sign(
            { userId: refreshDecode.userId, role: refreshDecode.role },
            "shhhhh",
            { expiresIn: 20 }
          );
          // req.set({ authorization: `Bearer ${newAccesstoken}` });
          decoded = jwt.verify(newAccesstoken, "shhhhh");
        }
      } else {
        res
          .status(400)
          .json({ message: "Login failed", errmessage: err.message });
      }
    }
    if (decoded && roleAllowed.includes(decoded.role)) {
      req.user = decoded.userId;
      req.userRole = decoded.role;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized..." });
    }
  };
};
module.exports = authMiddleware;
