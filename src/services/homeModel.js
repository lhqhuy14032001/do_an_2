const connection = require('../../configs/db');
const common = require('../common');
require('dotenv').config()

const homeModel = {
    getUserList: async (from = 0) => {
        let response = {};
        let sql = `SELECT id, email, isAdmin,  lastname, firstname, phonenumber, address FROM users ORDER BY id DESC  LIMIT ${from} , ${process.env.PAGE_SIZE}`;
        try {
            let result = await common.runQuery(connection, sql);
            response = result.length != [] ? {err: 0, data: result} : {
                err: 1,
                data: "No user in your list. Let's add user to your list."
            }
            return response
        } catch (error) {
            console.log('>>> Start check >>>')
            console.log(error)
            console.log('>>> End check >>>')
            response.err = 1;
            response.msg = error;
        }
        return response;
    },
    getUserByID: async (id) => {
        let sql = `SELECT id, email, lastname, firstname, address, phonenumber FROM users WHERE id = ${id};`;
        let response = {};
        try {
            let user = await common.runQuery(connection, sql);
            if (!user) {
                response.err = 1;
                response.msg = 'Not found user !!!';
            } else {
                response.err = 0;
                response.user = user[0];
            }
            return response
        } catch (error) {
            console.log('>>> Start check >>>')
            console.log(error)
            console.log('>>> End check >>>')
        }
    },
    deleteUserByID: async (id) => {
        try {
            let sql = `DELETE FROM users WHERE id = ${id};`
            let response = {}
            let stateDelete = await common.runQuery(connection, sql)
            if (stateDelete.affectedRows == 1) {
                let users = await homeModel.getUserList();
                response.msg = 'Xoá người dùng thành công !!!'
                response.users = users
            } else {
                response.err = 1;
                response.msg = 'Xoá người dùng thất bại !!!'
            }
            return response
        } catch (error) {
            console.log(error)
        }
    },
    editUser: async (data) => {
        let response = {};
        try {
            let {userID, firstname, lastname, email, address, phonenumber} = data;
            let sql = `UPDATE users SET firstname='${firstname}', lastname='${lastname}', email='${email}', address='${address}', phonenumber='${phonenumber}' WHERE users.id='${userID}';`
            await common.runQuery(connection, sql)
            response.err = 0
            response.msg = 'Cập nhật người dùng thành công !!!'
            return response
        } catch (error) {
            response.err = 1
            response.msg = 'Opps :<< !!! (Error)'
            return response
            console.log(error)
        }
    },
    getRowToPaging: async () => {
        let response = {}
        try {
            let page_size = process.env.PAGE_SIZE
            let rows = await common.getRowToPaging(connection, 'users')
            let quantity = Object.values(rows[0]) // chuyen object thanh mang
            let pages = quantity[0] / page_size
            response.err = 0;
            response.pageQuantity = Math.round(pages)
            return response
        } catch (error) {
            response.err = 1;
            response.pageQuantity = null
            console.log(error)
            return response
        }
    }

}
module.exports = homeModel;