const connection = require('../../configs/db');
const homeModel = require('../services/homeModel');
const common = require('../common')
require('dotenv').config();

const usersManage = {
    loginView: (req, res) => {
        return res.render('auth/login')
    },
    getHomepageAdmin: (req, res) => {
        try {
            return res.render('admin/index')
        } catch (error) {
            return res.render('404page')
        }
    },
    getUserList: async (req, res) => {
        try {
            let from = 0;
            let result = await homeModel.getUserList(from);
            if (result.err == 1) {
                return res.status(200).json({err: result.err, msg: 'Error from server !!!'});
            }
            return res.render('admin/users_manage/users_manage', {
                users: result.data,
                isShowViewmore: result.data.length < process.env.PAGE_SIZE ? true : false
            })
        } catch (error) {
            return res.render('404page')
        }
    },
    getInfoUserToEdit: async (req, res) => {
        try {
            let id = req.query.id
            if (!id) {
                return res.render('404page')
            } else {
                let user = await homeModel.getUserByID(id)
                if (user.err == 1) {
                    return res.render('404Page')
                }
                return res.render('admin/users_manage/editUser', {user: user.user})
            }
        } catch (error) {
            console.log('>>> Has a error >>>', error)
            return res.render('404page');
        }
    },
    deleteUser: async (req, res) => {
        try {
            let id = req.query.id
            let currentLoginUser = req.query.currentLoginUser
            if (!id && !currentLoginUser) {
                return res.render('404Page')
            }
            if (id == currentLoginUser) {
                return res.json({
                    err: 1,
                    msg: 'Bạn không thể xoá chính mình !!!'
                })
            }
            let stateDelete = await homeModel.deleteUserByID(id)
            return res.json(stateDelete)
        } catch (error) {
            console.log('>>> Has a error >>>', error)
            return res.render('404page');
        }
    },
    editUser: async (req, res) => {
        try {
            let data = req.body
            if (!data.firstname || !data.lastname || !data.email || !data.address || !data.phonenumber) {
                let response = {
                    err: 1,
                    msg: 'Some parameter is not provided !!!'
                }
                return res.send(response)
            }
            let stateEditUser = await homeModel.editUser(data)
            if (stateEditUser.err == 1) {
                return res.send(stateEditUser)
            }
            return res.send(stateEditUser)
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    },
    handleViewmore: async (req, res) => {
        try {
            let from = (req.query.page - 1) * process.env.PAGE_SIZE
            let users = await homeModel.getUserList(from)
            if (users.err == 1) {
                return res.json({users: []})
            }
            return res.json({users: users.data})
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    }
}

module.exports = usersManage;


