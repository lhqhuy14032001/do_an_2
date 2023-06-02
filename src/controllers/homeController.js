const connection = require('../../configs/db');
const {productModel, productManageToClient, productSevices, manageOrderModel} = require('../services/productModel');
const moment = require('moment');
const crypto = require("crypto");
const config = require("config");
const querystring = require("qs");
require('dotenv').config()

const homeController = {
    getHomePage: async (req, res) => {
        try {
            let categoryList = await productModel.getCategory('ALL');
            let latestProducts = await productManageToClient.getLatestProduct();
            if (categoryList.err == 1 && latestProducts.err == 1) {
                return res.render('customer/index', {categoryList: [], latestProducts: []})
            }
            return res.render('customer/index', {categoryList: categoryList.data, latestProducts: latestProducts.data})
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('customer/404page')
        }
    },
    getAllProduct: async (req, res) => {
        try {
            let cateID = req.query.cateID;
            if (!cateID) {
                let categoryList = await productModel.getCategory('ALL');
                let productList = await productSevices.getProducts('ALL');
                if (categoryList.err == 1 && productList.err == 1) {
                    return res.render('customer/shop', {
                        categoryList: [],
                        productList: [],
                        categoryName: '',
                        cateID: ''
                    })
                }
                return res.render('customer/shop', {
                    categoryList: categoryList.data,
                    productList: productList.data,
                    categoryName: 'Tất cả sản phẩm',
                    cateID: ''
                })
            } else {
                let categoryList = await productModel.getCategory('ALL');
                let cateName = await productModel.getCategory(cateID);
                let productList = await productSevices.getProductsByID(cateID);
                if (categoryList.err == 1 && productList.err == 1) {
                    return res.render('customer/shop', {
                        categoryList: [],
                        productList: [],
                        categoryName: '',
                        cateID: '',
                    })
                }
                return res.render('customer/shop', {
                    categoryList: categoryList.data,
                    productList: productList.data,
                    categoryName: `Sản phẩm thuộc ${cateName.data[0].category_name}`,
                    cateID: cateID,

                })
            }

        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    },
    handleCart: (req, res) => {
        try {
            return res.render('customer/cart')
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    },
    handleCheckout: (req, res) => {
        try {
            return res.render('customer/checkout')
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    },
    handleGetDetailProduct: async (req, res) => {
        try {
            let id = req.query.id;
            if (!id) {
                return res.render('customer/404page')
            }
            let product = await productSevices.getProducts(id);
            let category = await productModel.getCategory(product.data[0].category_id);
            let productDesc = product.data[0].product_description;
            let productRelated = await productManageToClient.getProductRelated(product.data[0].category_id, 4);
            if (product.err == 1 && productRelated.err == 1) {
                return res.render('customer/detail', {product: [], relatedProduct: []});
            }
            return res.render('customer/detail', {
                product: product.data[0],
                categoryName: category.data[0].category_name,
                desc: productDesc,
                relatedProduct: productRelated.data
            });
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    },
    getProductByCategory: async (req, res) => {
        try {
            let categoryID = req.query.cateID;
            let from = 0;
            if (!categoryID) {
                return res.json({msg: 'Danh mục không hợp lệ'})
            }
            let productsByCategory = await productSevices.getProductsByID(categoryID, from);
            return res.json({
                err: productsByCategory.err,
                data: productsByCategory.data,
                jsTag: "<%- include('components/scriptTag.ejs') -%>"
            })
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    },
    getProductByID: async (req, res) => {
        try {
            let id = req.query.id;
            let product = await productManageToClient.getProductByID(id);
            return res.json(product)
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    }


}
const cartController = {
    handlerCashOrder: async (req, res, next) => {
        try {
            let date = new Date();
            let order = req.body.order;
            let cart = order[0];
            let user = order[1];
            let idOrder = moment(date).format('DDHHmmss');
            let saveCart = await manageOrderModel.createOrder(cart, user, idOrder)
            return res.json(saveCart)
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    },
    handlerOnlinePayOrder: async (req, res) => {
        try {
            process.env.TZ = 'Asia/Ho_Chi_Minh';
            let order = req.body.order;
            let totalBill = order[2].amount;
            let cart = order[0]; //cart
            let user = order[1];//user


            let date = new Date();
            let createDate = moment(date).format('YYYYMMDDHHmmss');

            let ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;


            let tmnCode = process.env.VNP_TMNCODE;
            let secretKey = process.env.VNP_HASHSECRET;
            let vnpUrl = process.env.VNP_URL;
            let returnUrl = process.env.VNP_RETURNURL;
            let orderId = moment(date).format('DDHHmmss');
            // lấy tổng tiền đơn hàng
            let amount = totalBill;
            // loại thanh toán
            let bankCode = order[4].bankcode;
            let locale = order[3].language;
            if (locale === null || locale === '') {
                locale = 'vn';
            }
            let currCode = 'VND';
            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            vnp_Params['vnp_Locale'] = locale;
            vnp_Params['vnp_CurrCode'] = currCode;
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = `Thanh toán đơn hàng: ${orderId}. Tổng tiền: ${amount} đồng`;
            vnp_Params['vnp_OrderType'] = 'other';
            vnp_Params['vnp_Amount'] = amount * 100;
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;
            if (bankCode !== null && bankCode !== '') {
                vnp_Params['vnp_BankCode'] = bankCode;
            }

            vnp_Params = cartController.sortObject(vnp_Params);

            let querystring = require('qs');
            let signData = querystring.stringify(vnp_Params, {encode: false});
            let crypto = require("crypto");
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + querystring.stringify(vnp_Params, {encode: false});
            //save order to db
            await manageOrderModel.createOrder(cart, user, vnp_Params['vnp_TxnRef'], bankCode, '0', '0')
            // chuyển hướng đến trang thanh toán
            return res.json({url: vnpUrl})
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    },
    sortObject: (obj) => {
        let sorted = {};
        let str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    },
    getPayOnline: async (req, res) => {
        try {
            return res.render('/customer/pay')
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    },
    handleReceiveStatePay: async (req, res, next) => {
        try {


            let vnp_Params = req.query;

            let secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = cartController.sortObject(vnp_Params);

            let orderId = vnp_Params['vnp_TxnRef'];
            let rspCode = vnp_Params['vnp_ResponseCode'];
            // mã ngân hàng
            let bankCode = vnp_Params['vnp_BankCode'];
            // mã giao dịch tại ngân hàng
            let bankTranNo = vnp_Params['vnp_BankTranNo'];
            // nội dung thanh toán
            let orderInfo = vnp_Params['vnp_OrderInfo'];
            // mã giao dịch tại vnpay
            let vnpay_id = vnp_Params['vnp_TransactionNo']
            // total
            let amount = vnp_Params['vnp_Amount'] / 100;

            let tmnCode = process.env.VNP_TMNCODE;
            let secretKey = process.env.VNP_HASHSECRET;

            let querystring = require('qs');
            let signData = querystring.stringify(vnp_Params, {encode: false});
            let crypto = require("crypto");
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

            let paymentStatus = '0';
            // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
            //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
            //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

            let checkOrderId = await manageOrderModel.getOrderByID(orderId); // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
            let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn

            if (secureHash === signed) { //kiểm tra checksum
                if (checkOrderId.err == 0) {
                    if (checkAmount) {
                        if (paymentStatus == "0") {
                            //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                            if (rspCode == "00") {
                                //thanh cong
                                //paymentStatus = '1'
                                // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                                // res.status(200).json({RspCode: '00', Message: 'Success'})
                                let updateStatePayment = await manageOrderModel.updateOrderOnlinePayment(orderId, 1, bankCode, bankTranNo, vnpay_id, orderInfo);
                                return res.render('customer/statePay', {
                                    orderId: orderId,
                                    Message: 'Thanh toán thành công !!!',
                                    total: amount
                                })
                            } else {
                                //that bai
                                //paymentStatus = '2'
                                // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                                // res.status(200).json({RspCode: '00', Message: 'Success'})
                                let updateStatePayment = await manageOrderModel.updateOrderOnlinePayment(orderId, 0, bankCode, bankTranNo, vnpay_id, orderInfo);
                                return res.render('customer/statePay', {
                                    orderId: orderId,
                                    Message: 'Thanh toán thành công, cập nhật thông tin đơn hàng thất bại, vui lòng liên hệ chúng tôi để được hỗ trợ',
                                    total: amount
                                })
                            }
                        } else {
                            // res.status(200).json({
                            //     RspCode: '02',
                            //     Message: 'This order has been updated to the payment status'
                            // })
                            return res.render('customer/statePay', {
                                orderId: orderId,
                                Message: 'Đơn hàng đã thanh toán',
                                total: amount
                            })
                        }
                    } else {
                        // res.status(200).json({RspCode: '04', Message: 'Amount invalid'})
                        return res.render('customer/statePay', {
                            orderId: orderId,
                            Message: 'Số tiền thanh toán không hợp lệ',
                            total: amount
                        })
                    }
                } else {
                    // res.status(200).json({RspCode: '01', Message: 'Order not found'})
                    return res.render('customer/statePay', {
                        orderId: '',
                        Message: 'Không tìm thấy đơn hàng',
                        total: 0
                    })
                }
            } else {
                // res.status(200).json({RspCode: '97', Message: 'Checksum failed'})
                return res.render('customer/statePay', {
                    orderId: orderId,
                    Message: 'Đơn hàng không hợp lệ',
                    total: amount
                })
            }
        } catch (error) {
            console.log(error)
        }
    },
    HandlerSaveDetailPayment: async (req, res, next) => {
        try {
            let vnp_Params = req.query;
            let secureHash = vnp_Params['vnp_SecureHash'];

            let orderId = vnp_Params['vnp_TxnRef'];
            let rspCode = vnp_Params['vnp_ResponseCode'];
            // mã ngân hàng
            let bankCode = vnp_Params['vnp_BankCode'];
            // mã giao dịch tại ngân hàng
            let bankTranNo = vnp_Params['vnp_BankTranNo'];
            // nội dung thanh toán
            let orderInfo = vnp_Params['vnp_OrderInfo'];
            // mã giao dịch tại vnpay
            let vnpay_id = vnp_Params['vnp_TransactionNo']
            // total
            let amount = vnp_Params['vnp_Amount'];
            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = cartController.sortObject(vnp_Params);
            let config = require('config');
            let secretKey = config.get('vnp_HashSecret');
            let querystring = require('qs');
            let signData = querystring.stringify(vnp_Params, {encode: false});
            let crypto = require("crypto");
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

            let paymentStatus = '0';
            // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
            //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
            //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

            let checkOrderId = await manageOrderModel.getOrderByID(orderId); // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
            let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn

            if (secureHash === signed) { //kiểm tra checksum
                if (checkOrderId.err == 0) {
                    if (checkAmount) {
                        if (paymentStatus == "0") {
                            //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                            if (rspCode == "00") {
                                //thanh cong
                                //paymentStatus = '1'
                                // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                                // res.status(200).json({RspCode: '00', Message: 'Success'})
                                let updateStatePayment = await manageOrderModel.updateOrderOnlinePayment(orderId, 1, bankCode, bankTranNo, vnpay_id, orderInfo);
                                return res.render('customer/statePay', {
                                    orderId: orderId,
                                    Message: 'Thanh toán thành công !!!',
                                    total: amount,
                                    payContent: orderInfo
                                })
                            } else {
                                //that bai
                                //paymentStatus = '2'
                                // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                                // res.status(200).json({RspCode: '00', Message: 'Success'})
                                let updateStatePayment = await manageOrderModel.updateOrderOnlinePayment(orderId, 0, bankCode, bankTranNo, vnpay_id, orderInfo);
                                return res.render('customer/statePay', {
                                    orderId: orderId,
                                    Message: 'Thanh toán thành công, cập nhật thông tin đơn hàng thất bại, vui lòng liên hệ chúng tôi để được hỗ trợ',
                                    total: amount,
                                    payContent: orderInfo
                                })
                            }
                        } else {
                            // res.status(200).json({
                            //     RspCode: '02',
                            //     Message: 'This order has been updated to the payment status'
                            // })
                            return res.render('customer/statePay', {
                                orderId: orderId,
                                Message: 'Đơn hàng đã thanh toán',
                                total: amount,
                                payContent: orderInfo
                            })
                        }
                    } else {
                        // res.status(200).json({RspCode: '04', Message: 'Amount invalid'})
                        return res.render('customer/statePay', {
                            orderId: orderId,
                            Message: 'Số tiền thanh toán không hợp lệ',
                            total: amount,
                            payContent: orderInfo
                        })
                    }
                } else {
                    // res.status(200).json({RspCode: '01', Message: 'Order not found'})
                    return res.render('customer/statePay', {
                        orderId: '',
                        Message: 'Không tìm thấy đơn hàng',
                        total: 0,
                        payContent: orderInfo
                    })
                }
            } else {
                // res.status(200).json({RspCode: '97', Message: 'Checksum failed'})
                return res.render('customer/statePay', {
                    orderId: orderId,
                    Message: 'Đơn hàng không hợp lệ',
                    total: amount,
                    payContent: orderInfo
                })
            }
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = {homeController, cartController};