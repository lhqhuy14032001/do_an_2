const connection = require('../../configs/db');
const common = require('../common');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const authModel = {
    getUserById: (id) => {
        let sql = `SELECT isAdmin, email, lastname, firstname, phonenumber, address  FROM users WHERE id='${id}'`;
        let user = common.runQuery(connection, sql);
        user.then((user) => {
            return user.length != [] ? user : []
        })
    },
    checkUserExist: (email) => {
        let sql = `SELECT email FROM users WHERE email='${email}'`;
        let result = common.runQuery(connection, sql);
        let isExist = result.then((data) => {
            return data.length != [] ? true : false
        })
        return isExist;
    },
    // compare password
    comparePassWord: async (password, hashedPassword) => {
        let validPassword = await bcrypt.compare(password, hashedPassword)
        return validPassword
    },
    // register
    register: async (reqdata) => {
        let data = [reqdata.isAdmin, reqdata.email, reqdata.password, reqdata.lastname, reqdata.firstname, reqdata.phonenumber, reqdata.address];
        let isUserExist = await authModel.checkUserExist(reqdata.email);
        let sql = 'INSERT INTO users (isAdmin, email, password, lastname, firstname, phonenumber, address) VALUES (?, ?, ?, ?, ?, ?, ?);';
        let response = {};
        try {
            if (isUserExist) {
                response.err = 1;
                response.msg = 'Email đã được đăng ký, vui lòng thử email khác !!!'
            } else {
                let result = common.runQuery(connection, sql, data);
                response = result.then(async (data) => {
                    return {err: 0, msg: 'Thêm người dùng thành công !!!'}
                })
            }
        } catch (error) {
            response.err = 1;
            response.msg = error
        }
        return response;
    },
    login: async (email, password) => {
        try {
            let response = {}
            let sql = `SELECT * FROM users WHERE email = '${email}'`;
            let user = await common.runQuery(connection, sql);
            if (user.length === 0) {
                1
                response = {
                    err: 1,
                    msg: "Tên đăng nhập hoặc mật khẩu không đúng !!!",
                    user: []
                }
            } else {
                let validPassword = await authModel.comparePassWord(password, user[0].password)
                if (!validPassword) {
                    response = {
                        err: 1,
                        msg: "Tên đăng nhập hoặc mật khẩu không đúng !!!",
                        user: []
                    }
                }
                if (user && validPassword) {
                    delete user[0].password
                    let payload = {id: user[0].id, isAdmin: user[0].isAdmin}
                    let accessToken = common.generateToken(payload, '30m')
                    response = {
                        err: 0,
                        msg: 'Login success',
                        user: user[0],
                        accessToken: accessToken,
                    }
                }
            }
            return response
        } catch (error) {
            console.log(error)
        }
    },
    update: (updateData) => {
        let data = [updateData.isAdmin, updateData.email, updateData.lastname, updateData.firstname, updateData.phonenumber, updateData.address];
        let updateSql = `UPDATE users SET isAdmin = ?, email = ?, password = ?, lastname = ?, firstname = ?, phonenumber = ?, address = ? WHERE id = ?;`
    }
}
module.exports = authModel;