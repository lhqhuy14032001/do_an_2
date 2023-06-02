$(document).ready(() => {
    let btnCheckout = document.querySelector('.btn-checkout a')
    let cart = localStorage.getItem('cart')
    let idBillTotal = document.querySelector('#bill-total');
    if (cart) {
        cart = JSON.parse(cart);
        if (cart.length > 0) {
            //     check out
            let checkoutTotal = document.querySelector('.checkout-total');
            let billTotal = document.querySelector('.bill-total');

            let rowCheckout = '';
            let priceTotal = 0;
            let itemTotal = 0;
            cart.forEach((item) => {
                itemTotal = item.price * item.quantity
                priceTotal += itemTotal
                rowCheckout += `<li class="d-flex align-items-center justify-content-between"><strong
                                                    class="small fw-bold">${item.name}</strong><span
                                                    class="text-muted small">${new Intl.NumberFormat().format(itemTotal)}&#8363;</span></li>
                                        <li class="border-bottom my-2"></li>
                                       `
            })
            checkoutTotal.innerHTML = rowCheckout
            idBillTotal.value = priceTotal
            billTotal.innerHTML = `${new Intl.NumberFormat().format(priceTotal)}`
        }
    } else {
        btnCheckout.setAttribute('href', '/')
        btnCheckout.classList.add('d-none')
    }

//     handler payment
    let orderForm = $('#order-form');
    orderForm.validate({
        rules: {
            firstName: {
                required: true,
            },
            lastName: {
                required: true
            },
            phone: {
                required: true,
                number: true,
                rangelength: [10, 10],
                // pattern: /(|0[3|5|7|8|9])+([0-9]{8})\b/g
            },
            address: {
                required: true
            }
        },
        messages: {
            firstName: {
                required: "Vui lòng không bỏ trống tên",
            },
            lastName: {
                required: "Vui lòng không bỏ trống họ"
            },
            phone: {
                required: "Vui lòng không bỏ trống số điện thoại",
                number: "Vui lòng nhập số",
                rangelength: 'Vui lòng nhập đủ 10 số',
                // pattern: 'Vui lòng nhập điện thoại hợp lệ'
            },
            address: {
                required: "Vui lòng không bỏ trống số điện thoại"
            }
        }
    });
    let paymentMethod = $('#payment-method');
    let btnOrder = $('.btn-order');
    let btnPay = $('.btn-pay');

    let orderData = [];
    let order = localStorage.getItem('cart');
    if (order) {
        order = JSON.parse(order)
        orderData.push(order)
    }
    let date = new Date()
    let month = String(date.getMonth() + 1).padStart(2, "0");
    btnOrder.on('click', (event) => {
        event.preventDefault();
        if (paymentMethod.val() === '') {
            alert('Vui lòng chọn phương thức thanh toán')
        } else {
            if (orderForm.valid()) {
                let firstName = $('#firstName').val();
                let lastName = $('#lastName').val();
                let phoneNumber = $('#phone').val();
                let address = $('#address').val();
                orderData.push([
                    {firstName: firstName},
                    {lastName: lastName},
                    {phoneNumber: phoneNumber},
                    {address: address},
                    {date: `${date.getFullYear()}-${month}-${date.getDate()}`}
                ])
                if (paymentMethod.val() === 'cash') {
                    btnOrder.prop("disabled", true);
                    $.ajax({
                        url: '/cash-order',
                        type: 'POST',
                        data: JSON.stringify({order: orderData}),
                        contentType: 'application/json',
                        success: (data) => {
                            alert('Đặt hàng thành công')
                            if (data.err == 0) {
                                localStorage.removeItem('cart')
                                window.location.href = '/'
                            }
                        }
                    })
                } else if (paymentMethod.val() === 'online') {
                    let paymentOnline = $('#payment-online');
                    paymentOnline.removeClass('d-none');
                    paymentMethod.addClass('d-none');
                    btnOrder.addClass('d-none');
                    btnPay.removeClass('d-none')
                    paymentOnline.on('change', () => {
                        orderData.push({
                            bankcode: paymentOnline.val()
                        })
                    })
                    orderData.push({
                        amount: idBillTotal.value
                    })
                    orderData.push({
                        language: 'vn'
                    })
                    console.log('>>> Start check >>>')
                    console.log(orderData)
                    console.log('>>> End check >>>')
                    btnPay.on('click', (e) => {
                        e.preventDefault()
                        if (orderForm.valid()) {
                            $.ajax({
                                url: '/create-online-payment',
                                type: 'POST',
                                data: JSON.stringify({order: orderData}),
                                contentType: 'application/json',
                                success: (data) => {
                                    window.location.href = data.url
                                    localStorage.removeItem('cart')
                                }
                            })
                        }
                    })
                }
            }

        }

    })

})