const express = require('express');
const router = express.Router();
const usersManage = require('../controllers/users_manage');
const {categoryManage, productManage, manageOrder} = require('../controllers/productController');

const {uploadCategory, uploadProduct} = require('../../configs/uploadConfiguration')
const {cartController} = require("../controllers/homeController");


//User manage
router.get('/', usersManage.getUserList)
// router.get('/users-list', usersManage.getUserList)
router.get('/login', usersManage.loginView)
router.get('/edit', usersManage.getInfoUserToEdit)
router.get('/delete', usersManage.deleteUser)
router.post('/edit-user', usersManage.editUser)
router.get('/viewmore', usersManage.handleViewmore)

// Category manage
router.get('/category', categoryManage.getCategoryList)
router.post('/add-category', uploadCategory.single('image-category'), categoryManage.handleAddCategory)
router.post('/delete-category', categoryManage.handledeleteCategory)
router.post('/edit-category', uploadCategory.single('image_category_update'), categoryManage.handleUpdateCategory)

// Product manage
router.get('/product', productManage.getProducts)
router.get('/add_product', productManage.getViewAddProduct)
router.post('/add-product', uploadProduct.array('imageProduct', 10), productManage.addNewProduct)
router.get('/delete-product', productManage.handleDeleteProduct)
router.get('/filter-product', productManage.filterProductByCategoryID)
router.get('/viewmore-product', productManage.handleViewmore)
router.get('/get-edit-product', productManage.handleGetEditProduct)
router.post('/edit-product', uploadProduct.array('product_image', 10), productManage.handleEditProduct)

// order Mannage
router.get('/order', manageOrder.getOrderList);
router.get('/detail-order/:id', manageOrder.getDetailOrder)
router.get('/delete-order/:id', manageOrder.deleteOrder)
router.get('/pay/:id', manageOrder.updateStatePayment)
// router.get('/viewmore-order', cartController.handleViewmore)


router.all('*', (req, res) => {
    try {
        return res.render('404page')
    } catch (error) {
        console.log('>>> Start check')
        console.log(error)
        console.log('>>> End check')
    }
})


module.exports = router;