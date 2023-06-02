$(document).ready(() => {
    // khi vào Quản lý sản phẩm sẽ thiết lập cateID = ALL tại localStorage
    localStorage.setItem('cateID', 'ALL');
    let notification = $('.notification');
    let notification_success = $('.notification_success');
    let form = $('#add-category');
    let btnAddCategory = $('#btn-add-category');
    // validate forms
    form.validate({
        rules: {
            category_name: {
                required: true
            }
        },
        messages: {
            category_name: {
                required: 'Vui lòng không bỏ trống tên danh mục!'
            }
        }
    });

    notification.hide();
    notification_success.hide();
    let fileSelect = $('#img_category');
    btnAddCategory.on('click', (event) => {
        event.preventDefault();
        let formValid = form.valid();
        let categoryName = $('#category_name');
        let files = fileSelect[0].files;
        let file = files[0];
        let formData = new FormData();
        let tableCateList = $('#category-list tbody')
        let row = ''
        formData.append('category_name', categoryName.val());
        formData.append('image-category', file);
        if (formValid) {
            $.ajax({
                method: 'POST',
                contentType: false,
                data: formData,
                url: '/admin/add-category',
                processData: false,
                success: (data) => {
                    if (data.data.err == 1) {
                        $('#add_product_modal').modal('toggle');
                        notification.show();
                        notification.html(data.data.msg)
                    } else {
                        let category = data.data.data
                        row = `<tr>
                                <td>${category.category_name}</td>
                                <td>
                                    <div class="wrapper-img">
                                        <img class="img-category" src="${category.category_img}"/>
                                    </div>
                                </td>
                                <td>
                                    <a href="#" class="btn-delete btn btn-warning">Sửa</a>
                                    <a href="#" class="btn-delete btn btn-danger">Xoá</a>
                                </td>
                            </tr>`
                        $('#add_product_modal').modal('toggle');
                        tableCateList.append(row);
                        location.reload();
                    }
                }
            });
        }
    });

    // ===============PRODUCT======================
    // ADD NEW PRODUCT
    let btnAddProduct = $('#btn-add-product');
    let formAddProduct = $('#add-product');
    formAddProduct.validate({
        rules:
            {
                product_name: {
                    required: true
                },
                quantity_product: {
                    required: true,
                    number: true
                },
                price_product: {
                    required: true,
                    number: true
                },
                imageProduct: {
                    required: true
                }
            },
        messages: {
            product_name: {
                required: 'Vui Lòng không bỏ trống trên sản phẩm'
            }, quantity_product: {
                required: "Vui lòng không bỏ trống số lượng sản phẩm",
                number: "Vui lòng nhập đúng định dạng số"
            },
            price_product: {
                required: "Vui lòng không bỏ trống giá sản phẩm",
                number: "Vui lòng nhập đúng định dạng số"
            },
            imageProduct: {
                required: "Vui lòng chọn ảnh cho sản phẩm"
            }
        }
    });
    let categorySelect = $('.category-list');

    // handle get category id
    categorySelect.on('change', () => {
        let categoryId = categorySelect.val()
        // handle ajax to add new product
        btnAddProduct.on('click', (event) => {
            event.preventDefault();
            let dataProduct = new FormData();
            let imageProducts = $('#img_product');
            let formAddValid = formAddProduct.valid();
            let productName = $('#product_name').val();
            let priceProduct = $('#price_product').val();
            let quantityProduct = $('#quantity-product').val() > 0 ? $('#quantity-product').val() : 1;
            let desciptionProduct = CKEDITOR.instances['product-desc'].getData();
            if (imageProducts[0].files.length > 10) {
                alert('Chỉ chọn tối đa 10 ảnh');
            } else {
                for (let i = 0; i < imageProducts[0].files.length; i++) {
                    dataProduct.append("imageProduct", imageProducts[0].files[i])
                }
                dataProduct.append('priceProduct', priceProduct);
                dataProduct.append('productName', productName);
                dataProduct.append('quantityProduct', quantityProduct);
                dataProduct.append('categoryID', categoryId);
                dataProduct.append('desciptionProduct', desciptionProduct);
                if (formAddValid) {
                    $.ajax({
                        method: 'POST',
                        contentType: false,
                        data: dataProduct,
                        url: '/admin/add-product',
                        processData: false,
                        success: (data) => {
                            try {
                                if (data.stateAddProduct.err == 0) {
                                    // let products = data.stateAddProduct.product
                                    window.location.href = '/admin/product';
                                }
                            } catch (error) {
                                window.location.href = '*'
                            }

                        }
                    });
                }
            }
        })
    });


//     HANDLE EDIT PRODUCT
    let btnEditProduct = $('#btn-edit-product');
    btnEditProduct.on('click', (event) => {
        event.preventDefault();
        let dataProductUpdate = new FormData();
        let id = $('#product_id').val();
        let imageProducts = $('#img_product');
        let productName = $('#product_name').val();
        let priceProduct = $('#price_product').val();
        let quantityProduct = $('#quantity-product').val();
        let category = $('#category_list_update').val();
        let desciptionProduct = CKEDITOR.instances['product-desc'].getData();
        if (imageProducts[0].files.length > 10) {
            alert('Chỉ chọn tối đa 10 ảnh');
        } else {
            if (imageProducts[0].files.length == 0) {
                dataProductUpdate.append('price', priceProduct);
                dataProductUpdate.append('product_name', productName);
                dataProductUpdate.append('quantity', quantityProduct);
                dataProductUpdate.append('product_description', desciptionProduct);
                dataProductUpdate.append('id_product', id);
                dataProductUpdate.append('category_id', category);
                $.ajax({
                    method: 'POST',
                    contentType: false,
                    data: dataProductUpdate,
                    url: '/admin/edit-product',
                    processData: false,
                    success: (data) => {
                        try {
                            if (data.err == 0) {
                                alert(data.msg)
                                window.location.href = '/admin/product';
                            }
                        } catch (error) {
                            window.location.href = '*'
                        }
                    }
                });
            } else {
                for (let i = 0; i < imageProducts[0].files.length; i++) {
                    dataProductUpdate.append("product_image", imageProducts[0].files[i])
                }
                dataProductUpdate.append('price', priceProduct);
                dataProductUpdate.append('product_name', productName);
                dataProductUpdate.append('quantity', quantityProduct);
                dataProductUpdate.append('product_description', desciptionProduct);
                dataProductUpdate.append('id_product', id);
                $.ajax({
                    method: 'POST',
                    contentType: false,
                    data: dataProductUpdate,
                    url: '/admin/edit-product',
                    processData: false,
                    success: (data) => {
                        try {
                            if (data.err == 0) {
                                alert(data.msg)
                                window.location.href = '/admin/product';
                            }
                        } catch (error) {
                            window.location.href = '*'
                        }

                    }
                });
            }
        }


    })
//     filter
    let categoryFilter = $('#category-filter');
    let bodyProductList = $('.product-list tbody');
    $('.btn-filter').on('click', () => {
        let cateID = categoryFilter.val();
        localStorage.setItem('cateID', cateID);
        $.ajax({
            url: '/admin/filter-product',
            data: {categoryID: cateID},
            success: (data) => {
                let row = '';
                let img = '';
                bodyProductList.html('')
                if (data.err == 1) {
                    bodyProductList.html('Không có sản phẩm tồn tại trong danh mục được chọn')
                } else {
                    let productList = data.data;
                    productList.forEach((product) => {
                        for (let i = 0; i < product.product_img.split(",").length; i++) {
                            img = `<img class="img-product" src="${product.product_img.split(",")[0]} ">`
                            break;
                        }
                        row += `<tr>
                        <td>
                            <p class="block-ellipsis">${product.product_name}</p>
                        </td>
                        <td>
                            ${img}
                        </td>
                        <td>
                            <p>${product.quantity}</p>
                        </td>
                        <td>
                            <a href="/admin/get-edit-product?id=${product.id_product}"
                               class="btn btn-warning">Sửa</a>
                            <button onclick="handleDeleteProduct(${product.id_product})"
                                    class="btn-delete-product btn btn-danger">Xoá
                            </button>
                        </td>
                    </tr>`;
                    })
                    bodyProductList.html(row);
                }
            }
        })
    })


// Viewmore
    let btnViewMore = $('.viewMore-product');
    let table = $('.product-list tbody');
    let row;
    let page = 0;
    let page_size = 15;
    btnViewMore.on('click', () => {
        let cateID = localStorage.getItem('cateID');
        page++;
        $.ajax({
            url: '/admin/viewmore-product',
            data: {
                page: page,
                cateID: cateID
            },
            success: (data) => {
                if (data.data.length < page_size) {
                    btnViewMore.removeClass('d-block');
                    btnViewMore.addClass('d-none');
                }
                let products = data.data
                let imgList
                let img = '';
                products.forEach((product) => {
                    imgList = product.product_img.split(",");
                    imgList.forEach((item) => {
                        img = `<img class="img-product" src="${item}"/>`
                    })
                    row = `<tr>
                    <td> ${product.product_name} </td>
                    <td>
                        ${img}
                    </td>
                    <td>
                        <p> ${product.quantity} </p>
                    </td>
                    <td>
                        <button class="btn btn-warning">Sửa</button>
                        <button class="btn btn-danger">Xoá</button>
                    </td>
                </tr>`
                    table.append(row);
                    img = '';
                })

            }

        })

    })


})