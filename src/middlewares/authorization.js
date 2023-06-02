const jwt = require('jsonwebtoken');
require('dotenv').config();
const common = require('../common')

const middlewares = {
    verifyToken: (req, res, next) => {
        let token = common.getCookie(req, 'token')
        if (token) {
            let accessToken = token.split(' ')[1]
            jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (err, user) => {
                if (err) {
                    return res.render('auth/login')
                }
                // req.user = user;
                next()
            })
        } else {
            return res.render('auth/login')

        }
    }
}
module.exports = middlewares