$(document).ready(() => {
//     handle cart
    let cart = [];
    let productID;
    let productList = document.querySelectorAll('#id_product');
    // save cart in localStorage
    for (let i = 0; i < productList.length; i++) {
        productList[i].parentNode.addEventListener('click', async () => {
            productID = productList[i].innerHTML;
            $.ajax({
                url: '/product-by-id',
                data: {id: productID},
                success: async (data) => {
                    let cartStore = localStorage.getItem('cart')
                    if (cartStore) {
                        cart = JSON.parse(cartStore);
                    }
                    let product = data.data;
                    let item = await cart.find(cartItem => cartItem.id == product.id_product)
                    if (item) {
                        item.quantity += 1;
                    } else {
                        cart.push({
                            id: product.id_product,
                            name: product.product_name,
                            price: product.price,
                            img: product.product_img.split(',')[0],
                            quantity: 1
                        })
                    }
                    localStorage.setItem('cart', JSON.stringify(cart))
                }
            })
            location.reload()
        })
    }
    // show cart quantity
    let cartQuantityHTML = document.querySelector('.cart-quantity');
    let cartTable = document.querySelector('.cart-table tbody');
    let showCart = localStorage.getItem('cart');
    let totalBillHTML = document.querySelector('.total-bill')
    totalBill = 0
    if (showCart) {
        showCart = JSON.parse(showCart);
        if (showCart.length > 0) {
            cartQuantityHTML.innerHTML = showCart.length > 0 ? `(${showCart.length})` : '(0)';
//     show cart detail
            let row = 'Không có sản phẩm trong giỏ hàng';
            let itemPriceTotal;
            let totalBill = 0;
            if (showCart.length > 0) {
                row = '';
            }
            for (let i = 0; i < showCart.length; i++) {
                itemPriceTotal = showCart[i].price * showCart[i].quantity;
                totalBill += itemPriceTotal;
                row += `<tr>
                                <td class="ps-0 py-3 border-light" scope="row">
                                    <div class="d-flex align-items-center">
                                        <a class="reset-anchor d-block animsition-link" href="/detail-product?id=${showCart[i].id}">
                                            <img src="${showCart[i].img}" alt="..." width="70"/>
                                        </a>
                                        <div class="ms-3">
                                            <strong class="h6">
                                                <a class="reset-anchor animsition-link" href="/detail-product?id=${showCart[i].id}">${showCart[i].name}</a>
                                            </strong>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-3 align-middle border-light">
                                    <p class="mb-0 small">${new Intl.NumberFormat().format(showCart[i].price)}  &#8363;</p>
                                </td>
                                <td class="p-3 align-middle border-light">
                                    <div class="border d-flex align-items-center justify-content-between px-3"><span
                                                class="small text-uppercase text-gray headings-font-family">Số lượng</span>
                                        <div class="quantity">
                                            <input class="product-quantity form-control form-control-sm border-0 shadow-0 p-0"
                                                   type="text" value="${showCart[i].quantity}"/>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-3 align-middle border-light">
                                    <p class="mb-0 small">${new Intl.NumberFormat().format(itemPriceTotal)}  &#8363;</p>
                                </td>
                                <td class=" p-3 align-middle border-light">
                                        <a class="btn-delete-cart reset-anchor" >
                                        <input hidden id="id_product" value="${showCart[i].id}"/>
                                                <i class="fas fa-trash-alt small text-muted"></i>
                                        </a>
                                </td>
                                                
                            </tr>`
            }
            cartTable.innerHTML = row;
            totalBillHTML.innerHTML = new Intl.NumberFormat().format(totalBill);
            // DELETE CART ITEM
            let btnCartDelete = document.querySelectorAll('.btn-delete-cart');
            for (let i = 0; i < btnCartDelete.length; i++) {
                btnCartDelete[i].addEventListener('click', () => {
                    let id = btnCartDelete[i].firstElementChild.value;
                    showCart = showCart.filter((item) => {
                        return item.id != id
                    })
                    localStorage.setItem('cart', JSON.stringify(showCart))
                    location.reload()
                })
            }

        } else {
            $('.btn-checkout').addClass('d-none')
        }
    }

    //     Change quantity
    let productsQuantity = document.querySelectorAll('.product-quantity');
    let idProducts = document.querySelectorAll('#id_product')
    for (let i = 0; i < productsQuantity.length; i++) {
        productsQuantity[i].addEventListener('change', () => {
            showCart = showCart.find((item) => {
                if (idProducts[i].value == item.id) {
                    item.quantity = productsQuantity[i].value
                    localStorage.setItem('cart', JSON.stringify(showCart))
                    location.reload()
                }
            })
        })
    }


})