const authModel = require('../services/authModel');
const bcrypt = require('bcrypt');
const {cookie} = require('express-validator');
const jwt = require('jsonwebtoken');
const common = require('../common');
require('dotenv').config();

const authController = {
    // register
    register: async (req, res) => {
        try {
            let {isAdmin, email, lastname, firstname, phonenumber, address} = req.body;
            let pass = req.body.password;
            let salt = await bcrypt.genSaltSync(10)
            let password = await bcrypt.hash(pass, salt);
            let data = {isAdmin, email, password, lastname, firstname, phonenumber, address}
            let result = await authModel.register(data);
            return result.err == 0 ? res.status(200).json(result) : res.status(200).json(result)
        } catch (error) {
            console.log('>>> Start check >>>')
            console.log(error)
            console.log('>>> End check >>>')
        }
    },
    login: async (req, res) => {
        try {
            let {email, password} = req.body
            if (!email || !password) {
                return res.status(412).json({err: '1', message: 'Missing parameters'})
            }
            let user = await authModel.login(email, password)
            if (user.err == 1) {
                return res.json(user)
            }
            let accessToken = 'Bearer ' + user.accessToken
            res
                .cookie(
                    'token', accessToken, {
                        httpOnly: true,
                        sameSite: "strict"
                    }
                )
            return res.status(200).json(
                {
                    err: 0,
                    data: user.user,
                }
            );
        } catch (error) {
            console.log(error)
        }
    },
    logout: (req, res) => {
        try {
            res.clearCookie('token');
            return res.render('auth/login');
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    }
}
module.exports = authController
