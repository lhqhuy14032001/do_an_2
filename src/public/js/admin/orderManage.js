$(document).ready(() => {
    let formatDate = (date) => {
        let event = new Date(date);
        return (event.getDate() + '/' + (event.getMonth() + 1) + '/' + event.getFullYear())
    }
    // format date
    let dates = document.querySelectorAll('.custom-date .date');
    let event = '';
    dates.forEach((date) => {
        date.innerHTML = formatDate(date.innerHTML)
    })

    // date detail
    let dateDetail = document.querySelector('.date-order-detail');
    if (dateDetail != null) {
        let prevDate = dateDetail.innerHTML
        dateDetail.innerHTML = formatDate(prevDate);
    }


    let btnViewmore = document.querySelector('.btn-viewmore')
    let tableOrders = $('#order-list .order-list')
    let page = 0;
    let row = '';
    btnViewmore.addEventListener('click', () => {
        page += 1;
        $.ajax({
            method: 'GET',
            url: '/admin/order',
            data: {page: page},
            success: (data) => {
                if (!data.isShowViewmore) btnViewmore.classList.add('d-none');
                let pay = '';
                for (const order of data.orderList) {
                    if (!order.payment_status) {
                        pay = `<a href="/admin/pay/${order.id_bill}" class="btn-pay btn btn-primary">Thanh toán</a>`
                    } else {
                        pay = `<p></p>`;
                    }
                    row = `<tr>
                        <td class="id-order">
                            ${order.id_bill}
                        </td>
                        <td class="custom-date">
                            <p class="date">${formatDate(order.dateOrder)}</p>
                        </td>
                        <td>
                            ${new Intl.NumberFormat().format(order.total)}
                        </td>
                        <td>
                            ${order.customer_name}
                        </td>
                        <td>
                            ${order.customer_phonenumber}
                        </td>
                        <td>
                            ${order.payment_status ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                        </td>
                        <td>
                            ${pay}
                            <a href="/admin/detail-order/${order.id_bill}" class="btn-edit btn btn-warning">Chi
                                tiết</a>
                            <a href="/admin/delete-order/${order.id_bill}"
                               class="first btn-delete first btn btn-danger">
                                Xoá
                            </a>
                        </td>
                    </tr>`
                    tableOrders.append(row);
                    pay = '';
                }

            }
        })
    })

})