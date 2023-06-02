$(document).ready(() => {
    $('#create-user').validate({
        rules: {
            email: {required: true, email: true},
            password: {required: true, minlength: 6},
            lastname: {required: true},
            firstname: {required: true},
            phonenumber: {required: true, rangelength: [10, 10]},
            address: {required: true}
        },
        messages: {
            email: {
                required: 'Vui lòng không bỏ trống email !!!',
                email: 'Vui lòng nhập đúng định dạng email !!!'
            },
            password: {
                required: 'Vui lòng không bỏ trống mật khẩu !!!',
                minlength: 'Vui lòng nhập mật khẩu ít nhất 6 ký tự !!!'
            },
            lastname: {
                required: 'Vui lòng không bỏ trống họ !!!'
            },
            firstname: {
                required: 'Vui lòng không bỏ trống tên !!!'
            },
            phonenumber: {
                required: 'Vui lòng không bỏ trống số điện thoại !!!',
                rangelength: 'Vui lòng nhập số điện thoại hợp lệ ',
            },
            address: {
                required: 'Vui lòng không bỏ trống địa chỉ !!!'
            }
        }
    })
    $('#edit-user').validate({
        rules: {
            email: {required: true, email: true},
            lastname: {required: true},
            firstname: {required: true},
            phonenumber: {required: true, rangelength: [10, 10]},
            address: {required: true}
        },
        messages: {
            email: {
                required: 'Vui lòng không bỏ trống email !!!',
                email: 'Vui lòng nhập đúng định dạng email !!!'
            },
            password: {
                required: 'Vui lòng không bỏ trống mật khẩu !!!',
                minlength: 'Vui lòng nhập mật khẩu ít nhất 6 ký tự !!!'
            },
            lastname: {
                required: 'Vui lòng không bỏ trống họ !!!'
            },
            firstname: {
                required: 'Vui lòng không bỏ trống tên !!!'
            },
            phonenumber: {
                required: 'Vui lòng không bỏ trống số điện thoại !!!',
                rangelength: 'Vui lòng nhập số điện thoại hợp lệ ',
            },
            address: {
                required: 'Vui lòng không bỏ trống địa chỉ !!!'
            }
        }
    })
    //register
    $('.notification').hide();
    $('#add-user').on('click', (e) => {
        let formValid = $('#create-user').valid();
        let isAdminVal = $('#isAdmin').is(':checked') ? 1 : 0;
        let data = {
            isAdmin: isAdminVal,
            email: $('#email').val(),
            password: $('#password').val(),
            lastname: $('#lastname').val(),
            firstname: $('#firstname').val(),
            phonenumber: $('#phonenumber').val(),
            address: $('#address').val()
        }
        if (formValid) {
            $.ajax({
                type: "POST",
                url: "/auth/register",
                data: data,
                dataType: "json",
                success: function (response) {
                    if (response.err == 1) {
                        $('.notification').show();
                        $('.notification').html(response.msg);
                    } else {
                        let bodyPage = $('#body-page')
                        $('#exampleModal').modal('toggle');
                        location.reload();
                        // $.ajax({
                        //     type: "GET",
                        //     url: "/admin/users-list",
                        //     dataType: "html",
                        //     success: function (response) {
                        //         bodyPage.empty()
                        //         bodyPage.html(response)
                        //     }
                        // });
                    }
                }
            });
        }
    })

//     save edit user
    $('.btn-save-user').on('click', (event) => {
        event.preventDefault();
        let formValid = $('#edit-user').valid();
        let data = {
            userID: $('#userID').val(),
            firstname: $('#firstname').val(),
            lastname: $('#lastname').val(),
            email: $('#email').val(),
            address: $('#address').val(),
            phonenumber: $('#phonenumber').val()
        }
        $.ajax({
            method: 'POST',
            data: data,
            url: '/admin/edit-user',
            success: (data) => {
                if (data.err == 1) {
                    alert(data.msg)
                } else {
                    alert(data.msg)
                    window.location = '/admin/'
                }

            }
        })

    })

//    Popup state delete

//   btn-viewmore
    let bodyTableUsers = $('.users-list')
    let btnViewmore = $('.btn-viewmore')
    let page = 1
    let page_size = 15;
    btnViewmore.on('click', () => {
        page += 1;
        $.ajax({
            method: 'GET',
            data: {page: page},
            url: '/admin/viewmore',
            success: (data) => {
                if (data.users.length < page_size) {
                    btnViewmore.removeClass('d-block');
                    btnViewmore.addClass('d-none');
                } else {
                    btnViewmore.show()
                }
                let item = ''
                for (const user of data.users) {
                    isAdmin = user.isAdmin == 0 ? 'Nhân viên' : 'Quản trị viên'
                    item = `<tr>
                        <td>
                             ${user.email}
                        </td>
                        <td>
                             ${user.lastname}
                        </td>
                        <td>
                             ${user.firstname}
                        </td>
                        <td>
                             ${isAdmin}
                        </td>
                        <td>
                             ${user.phonenumber}
                        </td>
                        <td>
                             ${user.address}
                        </td>
                        <td>
                            <a href='/admin/edit?id=${user.id}' class='btn-edit btn btn-warning'>Sửa</a>
                            <a href='/admin/delete?id=${user.id}' class='btn-delete btn btn-danger'>Xoá</a>
                        </td>
                    </tr>
                    `
                    bodyTableUsers.append(item)
                }
            }
        })
    })


})