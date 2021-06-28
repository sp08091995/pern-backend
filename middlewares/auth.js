const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { Op, where } = require("sequelize");
const logger = require('../config/logger').authLogger;
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    const decoded = jwt.verify(token, "secretprivatekey");
    logger.info(decoded);
    const user = await User.findOne({
      where: {
        [Op.and]: {
          username: decoded.username,
          tokens: { [Op.contains]: [token] },
        },
      },
    });
    logger.info(user);
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    logger.error(error);
    res.status(401).send({ error: "Please Authenticate" });
  }
};

module.exports = auth;
