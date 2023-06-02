const connection = require('../../configs/db');
const common = require('../common');
const {home} = require("nodemon/lib/utils");
const {text} = require("express");
const {run} = require("nodemon/lib/monitor");
require('dotenv').config();


const productModel = {
    getCategory: async (id) => {
        let response = {};
        try {
            if (id == 'ALL') {
                let sql = "SELECT * FROM `category`";
                let result = await common.runQuery(connection, sql);
                response = result.length != [] ? {err: 0, data: result} : {
                    err: 1,
                    data: "No category in our list. Let's add category to our list."
                }
            } else {
                let sql = `SELECT * FROM category WHERE id=${id}`;
                let result = await common.runQuery(connection, sql);
                response = result.length != [] ? {err: 0, data: result} : {
                    err: 1,
                    data: "No category in our list. Let's add category to our list."
                }
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
    checkProductIsExistInCategory: async (categoryID) => {
        let isExist = true;
        let sql = `SELECT * FROM product WHERE category_id=${categoryID}`;
        let productList = await common.runQuery(connection, sql);
        if (productList.length == []) {
            isExist = false;
        }
        return isExist;
    },
    checkCategoryIsExist: async (categoryName) => {
        let isExist = false;
        let sql = 'SELECT category_name FROM category;';
        let categoryNameList = await common.runQuery(connection, sql);
        categoryNameList.map((cateName) => {
            if (cateName.category_name == categoryName) {
                isExist = true;

            }
        })
        return isExist;
    },
    deleteCategory: async (id) => {
        try {
            let isExist = await productModel.checkProductIsExistInCategory(id);
            let response = {}
            if (isExist) {
                response.err = 1;
                response.msg = 'Có sản phẩm trong danh mục này, nên không thể xoá !!!'
            } else {
                let sql = `DELETE FROM category WHERE id = ${id};`
                await common.runQuery(connection, sql);
                response.err = 0;
                response.msg = 'Xoá danh mục thành công !!!';
            }
            return response;
        } catch (error) {
            console.log(error)
        }
    },
    handleAddCategory: async (data) => {
        let response = {}
        try {
            let isExist = await productModel.checkCategoryIsExist(data.categoryName);
            if (isExist) {
                response.err = 1
                response.msg = 'Danh mục đã tồn tại trên hệ thống'
                response.data = []
            } else {
                let sql = `INSERT INTO category (category_name, category_img ) VALUES ('${data.categoryName}', '${data.img}');`
                let stateInsert = await common.runQuery(connection, sql);
                let category = await productModel.getCategory(stateInsert.insertId)
                if (stateInsert) {
                    response.err = 0
                    response.msg = 'Thêm danh mục thành công'
                    response.data = category.data[0]
                }
            }
        } catch (error) {
            response.err = 1
            response.msg = 'Thêm danh mục không thành công'
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
        return response
    },
    handleUpdateCategory: async (data) => {
        try {
            let id = data.id;
            let pathImg = data.img;
            let categoryName = data.categoryName;
            let sql, response = {};
            if (!pathImg) {
                sql = `UPDATE category SET category_name='${categoryName}' WHERE category.id='${id}';`;
            } else {
                sql = `UPDATE category SET category_name='${categoryName}', category_img='${pathImg}' WHERE category.id='${id}';`;
            }
            // affectedRows
            let stateUpdate = await common.runQuery(connection, sql);
            if (stateUpdate.affectedRows == 1) {
                response.err = 0;
                response.msg = 'Cập nhật danh mục thành công !!!'
            } else {
                response.err = 1;
                response.msg = 'Cập nhật danh mục thất bại. Vui lòng thử lại !!!'
            }
            return response;
        } catch (error) {
            console.log(error)
        }


    }
};
const productSevices = {
    getProducts: async (id, from = 0) => {
        let productID = id;
        let sql, response = {};
        if (productID == 'ALL') {
            sql = `SELECT * FROM product LIMIT ${from},  ${process.env.PAGE_SIZE};`;
        } else {
            sql = `SELECT * FROM product WHERE id_product = ${productID};`;
        }
        let data = await common.runQuery(connection, sql);
        if (data != []) {
            response.err = 0;
            response.data = data
        } else {
            response.err = 1;
            response.data = [];
        }
        return response;
    },
    handleAddProduct: async (product) => {
        try {
            let {productName, img, quantityProduct, categoryID, desciptionProduct, priceProduct} = product;
            let sql = `INSERT INTO product (product_name, product_description, product_img, category_id, quantity, price) VALUES ('${productName}', '${desciptionProduct}', '${img}', ${categoryID}, ${quantityProduct}, ${priceProduct} );`
            let response = {};
            let stateAddProduct = await common.runQuery(connection, sql);
            if (stateAddProduct.insertId) {
                let newProduct = await productSevices.getProducts(stateAddProduct.insertId);
                if (newProduct.err == 0) {
                    response.err = 0;
                    response.msg = 'Thêm sản phẩm thành công';
                    response.product = newProduct.data[0];
                }
            } else {
                response.err = 1;
                response.msg = 'Thêm sản phẩm không thành công'
            }
            return response;
        } catch (error) {
            console.log(error)
        }
    },
    handleDeleteProduct: async (productID) => {
        try {
            let sql = `DELETE FROM product WHERE id_product = ${productID};`;
            let response = {}
            let stateDelete = await common.runQuery(connection, sql);
            if (stateDelete.affectedRows != 1) {
                response.err = 1;
                response.msg = 'Xoá sản phẩm không thành công !!!'
            }
            response.err = 0;
            response.msg = 'Xoá sản phẩm thành công !!!'
            return response
        } catch (error) {
            console.log(error)
        }
    },
    handleEditProduct: async (id, fieldUpdate) => {
        try {
            let productID = id;
            let dataUpdate = fieldUpdate;
            let column = [];
            let respone = {};
            for (let i = 0; i < dataUpdate.length; i++) {
                if (i != (dataUpdate.length - 1)) {
                    column += `${dataUpdate[i][0]} = '${dataUpdate[i][1]}' ,`
                } else {
                    column += `${dataUpdate[i][0]}='${dataUpdate[i][1]}'`
                }
            }

            let sql = `UPDATE product SET ${column} WHERE id_product = ${productID} ;`
            let stateUpdate = await common.runQuery(connection, sql);

            if (stateUpdate.affectedRows == 1) {
                respone.err = 0;
                respone.msg = 'Cập nhật thành công !'
            } else {
                respone.err = 1;
                respone.msg = 'Cập nhật thất bại !'
            }
            return respone;
        } catch (error) {
            console.log(error)
        }

    },
    getProductsByID: async (cateID, from = 0) => {
        try {
            let res = {};
            let sql = '';
            if (cateID == 'ALL') {
                sql = `SELECT * FROM product ORDER BY product.id_product DESC LIMIT ${from}, ${process.env.PAGE_SIZE};`
            } else {
                sql = `SELECT * FROM product WHERE category_id = ${cateID} ORDER BY product.id_product DESC LIMIT ${from}, ${process.env.PAGE_SIZE};`
            }
            let state = await common.runQuery(connection, sql);
            if (state.length > 0) {
                res.err = 0;
                res.data = state;
            } else {
                res.err = 1;
                res.data = [];
            }
            return res;
        } catch (error) {
            console.log(error)
        }

    }
}
const productManageToClient = {
    getLatestProduct: async () => {
        try {
            let sql = `SELECT * FROM product ORDER BY id_product DESC LIMIT 8;`;
            let resposne = {};
            let latestProduct = await common.runQuery(connection, sql);
            if (latestProduct != []) {
                resposne.err = 0;
                resposne.data = latestProduct;
            } else {
                resposne.err = 1;
                resposne.data = [];
            }
            return resposne;
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')

        }
    },
    getProductRelated: async (cateID, limit = 4) => {
        try {
            let sql = `SELECT * FROM product WHERE category_id = ${cateID} ORDER BY product.id_product DESC LIMIT ${limit};`;
            let res = {};
            let productsRelated = await common.runQuery(connection, sql);
            if (productsRelated.length == 0) {
                res.err = 1;
                res.data = []
            } else {
                res.err = 0;
                res.data = productsRelated;
            }
            return res;
        } catch (error) {
            console.log(error)
        }

    },
    getProductByID: async (id) => {
        try {
            let res = {};
            let sql = `SELECT * FROM product WHERE id_product = ${id};`;
            let product = await common.runQuery(connection, sql);
            if (product.length != 0) {
                res.err = 0;
                res.data = product[0]
            } else {
                res.err = 0;
                res.data = []
            }
            return res
        } catch (error) {
            console.log(error)
        }
    }
};
const manageOrderModel = {
    getOrderList: async (from) => {
        try {
            let res = {};
            let orderList
            if (!from) {
                from = 0
                let sql = `SELECT * FROM \`order\` LIMIT ${from}, ${process.env.PAGE_SIZE}`;
                orderList = await common.runQuery(connection, sql)
            } else {
                let sql = `SELECT * FROM \`order\` LIMIT ${from}, ${process.env.PAGE_SIZE}`;
                orderList = await common.runQuery(connection, sql)
            }
            if (orderList.length > 0) {
                res.err = 0;
                res.data = orderList
            } else {
                res.err = 1;
                res.data = [];
            }
            return res
        } catch (error) {
            console.log(error)
        }
    },
    updateQuantityProduct: async (id, quantity) => {
        let sqlSelect = `SELECT quantity FROM product WHERE id_product = ${id}`;
        let product = await common.runQuery(connection, sqlSelect);
        let sqlUpdate = `UPDATE product SET quantity = ${(product[0].quantity - quantity)} WHERE id_product = ${id}`
        let stateUpdate = await common.runQuery(connection, sqlUpdate);
        return stateUpdate.changedRows == 1 ? true : false;
    },
    deleteOrder: async (id) => {
        try {
            let res = {};
            let sqlDeleteOrderDetails = `DELETE FROM \`order_detail\` WHERE \`id_bill\` = ${id};`
            let sqlDeleteOrder = `DELETE FROM \`order\` WHERE \`id_bill\` = ${id};`
            await common.runQuery(connection, sqlDeleteOrderDetails)
            await common.runQuery(connection, sqlDeleteOrder);
            res.err = 0;
            res.msg = 'Xoá đơn hàng thành công'
            return res
        } catch (error) {
            console.log(error)
        }
    },
    getOrderByID: async (id) => {
        try {
            let res = {};
            let sqlGetOrder = `SELECT id_bill, dateOrder, total, customer_phonenumber, customer_name, payment_status, address
FROM \`order\`
WHERE id_bill = ${id}; `
            let sqlGetDetailBill = `SELECT * FROM \`order_Detail\` WHERE id_bill = ${id};`
            let orders = await common.runQuery(connection, sqlGetOrder);
            let orderDetails = await common.runQuery(connection, sqlGetDetailBill);
            if (orders.length > 0 && orderDetails.length > 0) {
                res.err = 0
                res.orderInfo = orders[0];
                let pro = '';
                let productList = [];
                let product = {
                    name: '',
                    quantity: 0,
                    price: 0,
                    total: 0,
                    totalQuantity: 0
                };
                let totalQuantity = 0;
                for (const item of orderDetails) {
                    pro = await productSevices.getProducts(item.id_product);
                    product.name = pro.data[0].product_name;
                    product.quantity = item.quantity;
                    product.price = pro.data[0].price;
                    product.total = (item.quantity * pro.data[0].price)
                    product.totalQuantity = totalQuantity += item.quantity
                    productList.push(product);
                    product = {
                        name: '',
                        quantity: 0,
                        price: 0,
                        total: 0,
                        totalQuantity: 0
                    }
                }
                res.products = productList;

            } else {
                res.err = 1;
            }
            return res
        } catch (error) {
            console.log(error)
        }
    },
    updateStatePayment: async (id) => {
        let sql = `UPDATE \`order\` SET payment_status = 1 WHERE id_bill = ${id} ; `
        let state = await common.runQuery(connection, sql);
        if (state.affectedRows == 1) return true;
        return false;
    },
    createOrder: async (cart, user, id_bill, vnp_bankCode, vnp_bankTran, vnp_tranNumber) => {
        try {
            let bankCode, bankTran, vnp_TranNumber;
            if (!bankCode && !bankTran && !bankTran) {
                bankCode = 'cash';
                bankTran = 'cash';
                vnp_TranNumber = 'cash';
            } else {
                bankCode = vnp_bankCode;
                bankTran = vnp_bankTran;
                vnp_TranNumber = vnp_tranNumber;
            }
            let res;
            let idBill = id_bill;
            let sqlSaveDetailOrder = '';
            let sqlSaveOrder = '';
            let sqlUpdateQuantity = ''
            let totalBill = 0;
            let name = `${user[1].lastName} ${user[0].firstName}`
            cart.forEach((item) => {
                totalBill += (item.price * item.quantity)
            })
            sqlSaveOrder = `INSERT \`order\` (id_bill, dateOrder, total, customer_phonenumber, customer_name, payment_status, bankcode, banTranNo, vnp_TransactionNo, address) VALUES ('${id_bill}','${user[4].date}', ${totalBill}, '${user[2].phoneNumber}', '${name}', 0, '${bankCode}', '${bankTran}', '${vnp_TranNumber}', '${user[3].address}');`

            let saveOrder = await common.runQuery(connection, sqlSaveOrder);
            for (const item of cart) {
                sqlSaveDetailOrder = `INSERT INTO \`order_detail\` VALUES (${idBill}, ${item.id}, ${item.quantity});`
                await common.runQuery(connection, sqlSaveDetailOrder);
                await manageOrderModel.updateQuantityProduct(item.id, item.quantity);
                sqlSaveDetailOrder = '';
            }
            return res = {err: 0}
        } catch (error) {
            console.log(error)
        }
    },
    updateOrderOnlinePayment: async (id, paymentState, bankcode, bankTranNo, vnp_TranNo, orderInfo) => {
        let sql = `UPDATE \`order\` SET payment_status = ${paymentState}, bankcode = '${bankcode}', banTranNo='${bankTranNo}', vnp_TransactionNo = '${vnp_TranNo}',
 payment_content = '${orderInfo}' WHERE id_bill = ${id} ;`
        let state = await common.runQuery(connection, sql);
        console.log('>>> Start check >>>')
        console.log(state)
        console.log('>>> End check >>>')
        if (state.affectedRows == 1) return {err: 0};
        return {err: 1};
    }
}
module.exports = {productModel, productSevices, productManageToClient, manageOrderModel};