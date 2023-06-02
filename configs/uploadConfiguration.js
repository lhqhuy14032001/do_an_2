const multer = require("multer");
const appRoot = require("app-root-path");
const path = require("path");
const storageCategory = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, appRoot + '/src/public/uploads/category-img');
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const storageProduct = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, appRoot + '/src/public/uploads/product-img');
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, 'productImg' + '-' + file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        // req.fileValidationError = 'Only image files are allowed!';
        // return req.json(res);
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const uploadCategory = multer({storage: storageCategory, fileFilter: imageFilter})
const uploadProduct = multer({
    storage: storageProduct,
    fileFilter: imageFilter
})
module.exports = {
    uploadCategory,
    uploadProduct
}