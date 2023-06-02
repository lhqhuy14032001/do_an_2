"use strict"
const multer = require('multer')
const path = require('path')
// const productModel = require('../services/productModel')
const {productModel, productSevices, manageOrderModel} = require('../services/productModel')
const {
    uploadCategory,
    uploadProduct
} = require('../../configs/uploadConfiguration')
const categoryManage = {
    getCategoryList: async (req, res) => {
        try {
            let id = req.query.id;
            if (id) {
                let categoryInfo = await productModel.getCategory(id);
                return res.json({categoryInfo: categoryInfo});
            } else {
                id = 'ALL'
                let categoryList = await productModel.getCategory(id)
                if (categoryList.err == 1) {
                    return res.render('admin/category_manage/categoryList', {categoryList: []})
                }
                return res.render('admin/category_manage/categoryList', {categoryList: categoryList.data})
            }
        } catch (error) {
            console.log('>>> Has a error >>>', error)
            return res.render('404page');
        }
    },
    handleAddCategory: async (req, res) => {
        try {
            let categoryName = req.body.category_name
            let pathToImg = ''
            let data = {}
            // 'profile_pic' is the name of our file input field in the HTML form
            // let upload = multer({
            //     storage: uploadCategory.storage,
            //     fileFilter: uploadCategory.imageFilter
            // }).single('image-category');
            let upload = uploadCategory.single('image-category');
            upload(req, res, async function (err) {
                // req.file contains information of uploaded file
                // req.body contains information of text fields, if there were any
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (!req.file) {
                    return res.send('Vui lòng chọn ảnh cho danh mục');
                } else if (err instanceof multer.MulterError) {
                    return res.send('Some thing is wrong with Multer', err);
                } else if (err) {
                    return res.send(err);
                }
                // Display uploaded image for user validation
                pathToImg = `/uploads/category-img/${req.file.filename}`
                data = {
                    categoryName: categoryName,
                    img: pathToImg
                }
                let stateAddCategory = await productModel.handleAddCategory(data)
                if (stateAddCategory.err == 1) {
                    return res.json({data: stateAddCategory})
                }
                return res.json({data: stateAddCategory})
            })
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    },
    handledeleteCategory: async (req, res) => {
        try {
            let idCategory = req.body.id;
            let stateDelete = await productModel.deleteCategory(idCategory);
            if (stateDelete.err === 1) {
                return res.json({
                    err: stateDelete.err,
                    msg: stateDelete.msg
                })
            }
            return res.json({
                err: stateDelete.err,
                msg: stateDelete.msg
            })
        } catch (error) {
            console.error(error)
            return res.render('404page');
        }
    },
    handleUpdateCategory: async (req, res) => {
        try {
            let id = req.body.id;
            let categoryName = req.body.category_name
            let pathToImg = ''
            let data = {}
            let upload = multer({
                storage: categoryManage.storage,
                fileFilter: categoryManage.imageFilter
            }).single('image_category_update');
            upload(req, res, async function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (!req.file) {
                    // return res.json({
                    //     msg: 'Vui lòng chọn ảnh cho danh mục',
                    //     err: 2
                    // });
                    data = {
                        id: id,
                        categoryName: categoryName,
                        img: pathToImg
                    }
                    let stateUpdate = await productModel.handleUpdateCategory(data)
                    return res.json(stateUpdate);
                } else if (err instanceof multer.MulterError) {
                    return res.send('Some thing is wrong with Multer', err);
                } else if (err) {
                    return res.send(err);
                }
                // Display uploaded image for user validation
                pathToImg = `/uploads/category-img/${req.file.filename}`
                data = {
                    id: id,
                    categoryName: categoryName,
                    img: pathToImg
                }
                let stateUpdate = await productModel.handleUpdateCategory(data);
                return res.json(stateUpdate);
            })
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    }
};
const productManage = {
    getProducts: async (req, res) => {
        try {
            let from = 0;
            let categoryList = await productModel.getCategory('ALL');
            let id = req.body.productId;
            if (categoryList.err == 1) {
                return res.render('admin/products_manage/productList', {categoryList: [], isShowViewmore: true})
            }
            if (!id) {
                let products = await productSevices.getProducts('ALL', from);
                if (products.err == 1) {
                    return res.render('admin/products_manage/productList', {productList: [], isShowViewmore: true})
                }
                return res.render('admin/products_manage/productList', {
                    products: products.data,
                    categoryList: categoryList.data,
                    isShowViewmore: products.data.length < process.env.PAGE_SIZE ? true : false
                })
            } else {
                let product = await productSevices.getProducts(id);
                if (product.err == 1) {
                    return res.render('admin/products_manage/productList', {product: [], isShowViewmore: true})
                }
                return res.render('admin/products_manage/productList', {
                    product: product.data,
                    categoryList: categoryList.data,
                    isShowViewmore: product.data.length < process.env.PAGE_SIZE ? true : false
                })
            }
            // return res.render('admin/products_manage/productList', {categoryList: categoryList.data})
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    },
    addNewProduct: async (req, res) => {
        try {
            let {productName, quantityProduct, categoryID, desciptionProduct, priceProduct} = req.body;
            // let productName = req.body.productName;
            // let quantityProduct = req.body.quantityProduct;
            // let categoryID = req.body.categoryID;
            // let desciptionProduct = req.body.desciptionProduct;
            let imgList = req.files
            let imagesProduct = [];
            imgList.forEach((img) => {
                imagesProduct.push(`/uploads/product-img/${img.filename}`)
            })
            let product = {
                priceProduct: priceProduct,
                productName: productName,
                img: imagesProduct,
                quantityProduct: quantityProduct,
                categoryID: categoryID,
                desciptionProduct: desciptionProduct
            }
            let stateAddProduct = await productSevices.handleAddProduct(product);
            if (stateAddProduct.err == 1) {
                return res.json(stateAddProduct)
            }
            return res.json({stateAddProduct})
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    },
    handleDeleteProduct: async (req, res) => {
        try {
            let idProduct = req.query.id;
            let stateDelete = await productSevices.handleDeleteProduct(idProduct);
            if (!idProduct || stateDelete.err == 1) {
                return res.render('404page')
            }
            return res.json(stateDelete)
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    },
    filterProductByCategoryID: async (req, res) => {
        try {
            let categoryID = req.query.categoryID;
            let from = 0;
            if (!categoryID) {
                return res.json({msg: 'Danh mục không hợp lệ'})
            }
            let productsByCategory = await productSevices.getProductsByID(categoryID, from);
            return res.json({
                err: productsByCategory.err,
                data: productsByCategory.data
            })
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    },
    handleViewmore: async (req, res) => {
        try {
            let cateID = req.query.cateID;
            let from = (req.query.page - 1) * process.env.PAGE_SIZE;
            if (cateID == "ALL") {
                let products = await productSevices.getProductsByID(cateID, from)
                return res.json(products);
            } else {
                let productByCategory = await productSevices.getProductsByID(cateID, from)
                return res.json(productByCategory);
            }
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    },
    handleGetEditProduct: async (req, res) => {
        try {
            let productID = req.query.id;
            let productInfo = await productSevices.getProducts(productID);
            let cateName = await productModel.getCategory(productInfo.data[0].category_id);
            let cateList = await productModel.getCategory('ALL')
            console.log('>>> Start check >>>')
            console.log()
            console.log('>>> End check >>>')

            if (productInfo.err == 1 || cateName.err == 1 || cateList.err == 1) {
                return res.render('404page');
            }
            return res.render('admin/products_manage/editProduct', {
                productInfo: productInfo.data[0],
                productID: productID,
                cateName: cateName.data[0].category_name,
                categoryList: cateList.data
            });
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    },
    handleEditProduct: async (req, res) => {
        try {
            let imgList = req.files
            let {id_product, product_name, product_description, price, quantity, category_id} = req.body;
            let product_img = [];
            let fieldUpdate = [];
            if (imgList.length !== 0) {
                imgList.forEach((img) => {
                    product_img.push(`/uploads/product-img/${img.filename}`)
                })
                fieldUpdate.push(['product_img', product_img]);
            }
            if (product_name !== '') fieldUpdate.push(['product_name', product_name]);

            if (product_description !== '') fieldUpdate.push(['product_description', product_description]);

            if (price !== '') fieldUpdate.push(['price', price]);

            if (quantity !== '') fieldUpdate.push(['quantity', quantity]);

            if (category_id !== '') fieldUpdate.push(['category_id', category_id]);

            let stateUpadate = await productSevices.handleEditProduct(id_product, fieldUpdate);
            return res.json(stateUpadate)
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    },
    getViewAddProduct: async (req, res) => {
        try {
            let categoryList = await productModel.getCategory('ALL');
            if (categoryList.err == 1) {
                return res.render('admin/products_manage/addProduct', {
                    categoryList: []
                });
            }
            return res.render('admin/products_manage/addProduct', {
                categoryList: categoryList.data
            });

        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
            return res.render('404page');
        }
    }
};
const manageOrder = {
    getOrderList: async (req, res) => {
        try {
            let page = req.query.page;
            let orderList
            let isShowViewMore
            if (!page) {
                orderList = await manageOrderModel.getOrderList()
                isShowViewMore = orderList.data.length < process.env.PAGE_SIZE ? false : true;
                return res.render('admin/order_manage/orderList', {
                    orderList: orderList.data,
                    isShowViewmore: isShowViewMore
                })
            } else {
                let from = (req.query.page - 1) * process.env.PAGE_SIZE;
                orderList = await manageOrderModel.getOrderList(from)
                isShowViewMore = orderList.data.length < process.env.PAGE_SIZE ? false : true;
                return res.json({
                    orderList: orderList.data,
                    isShowViewmore: isShowViewMore
                })
            }


        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    },
    getDetailOrder: async (req, res) => {
        try {
            let idOrder = req.params.id;
            if (!idOrder) {
                return res.redirect('*')
            }
            let detailBill = await manageOrderModel.getOrderByID(idOrder);
            if (detailBill.err == 1) return res.render('404page')
            else {
                return res.render('admin/order_manage/orderDetail', {
                    orderInfo: detailBill.orderInfo,
                    products: detailBill.products
                })

            }
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    },
    deleteOrder: async (req, res) => {
        try {
            let id = req.params.id;
            if (!id) {
                return res.json({
                    err: 1,
                    msg: 'Không tìm thấy đơn hàng!'
                })
            }
            let stateDelete = await manageOrderModel.deleteOrder(id);
            return res.redirect('/admin/order')
        } catch (error) {
            console.log(error)
        }
    },
    updateStatePayment: async (req, res) => {
        try {
            let id = req.params.id;
            if (!id) return res.redirect('*');
            let stateUpdate = await manageOrderModel.updateStatePayment(id);
            if (stateUpdate) return res.redirect('/admin/order');
            return res.redirect('*');
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    },
    handleViewmore: async (req, res) => {
        try {
            let from = (req.query.page - 1) * process.env.PAGE_SIZE;
            let orderList = await manageOrderModel.getOrderList(from)
            let isShowViewMore = orderList.data.length < process.env.PAGE_SIZE ? false : true;
            return res.json({
                orderList: orderList.data,
                isShowViewmore: isShowViewMore
            })
        } catch (error) {
            console.log('>>> Start check')
            console.log(error)
            console.log('>>> End check')
        }
    }
};

module.exports = {categoryManage, productManage, manageOrder};