$(document).ready(() => {
    $('.log-in').validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 6
            }
        },
        messages: {
            email: {
                required: "Vui lòng không bỏ trống username !!!",
                email: "Vui lòng nhập đúng định dạng email !!!"
            },
            password: {
                required: "Vui lòng không bỏ trống mật khẩu !!!",
                minlength: "Mật khẩu phải có ít nhất 6 ký tự"
            }
        }
    });

    $('.notify-error').hide();
    $('.log-in-btn').on('click', (e) => {
        e.preventDefault();
        let email = $('.email').val();
        let password = $('.password').val();
        let data = {email, password}
        let formValid = $('.log-in').valid()
        if (formValid) {
            $.post("/auth/login", data, (user, state) => {
                if (user.err == 0) {
                    let fullName = `${user.data.lastname} ${user.data.firstname}`
                    let idUser = user.data.id
                    localStorage.setItem('userLogin', fullName)
                    localStorage.setItem('userLoginID', idUser)
                    window.location = '/admin/'
                } else {
                    $('.notify-error').show();
                    $('.notify-error .error-content').html(user.msg);
                }
            })
        }
    })
})