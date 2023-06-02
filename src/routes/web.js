const express = require('express');
const router = express.Router();
const {homeController, cartController} = require('../controllers/homeController');
const {manageOrder} = require("../controllers/productController");


router.get('/', homeController.getHomePage);
router.get('/all-product', homeController.getAllProduct);
router.get('/cart', homeController.handleCart);
router.get('/checkout', homeController.handleCheckout);
router.get('/detail-product', homeController.handleGetDetailProduct);
router.get('/product-by-category', homeController.getProductByCategory);
router.get('/product-by-id', homeController.getProductByID);

// Payment
router.post('/cash-order', cartController.handlerCashOrder);

router.post('/create-online-payment', cartController.handlerOnlinePayOrder);

router.get('/vnpay_ipn', cartController.HandlerSaveDetailPayment)


router.get('/vnpay_return', cartController.handleReceiveStatePay);

router.all('*', (req, res) => {
    try {
        return res.render('customer/404page')
    } catch (error) {
        console.log('>>> Start check')
        console.log(error)
        console.log('>>> End check')
    }
})

module.exports = router;