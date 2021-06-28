const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { Op, where } = require("sequelize");
const logger = require('../config/logger').authLogger;

function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User') 
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authorize based on user role
        async (req, res, next) => {
            try {
                // authenticate JWT token and attach user to request object (req.user)
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
                if (roles.length && !roles.includes(user.role)) {
                    // user's role is not authorized
                    return res.status(401).json({ message: 'Unauthorized' });
                }
    
                // authentication and authorization successful
                next();

              } catch (error) {
                logger.error(error);
                res.status(401).send({ error: "Please Authenticate" });
              }
            
        }
    ];
}

module.exports = { authorize }