'use strict';


/* ===============================================================
    GLIGHTBOX
=============================================================== */
const lightbox = GLightbox({
    touchNavigation: true,
});
/* ===============================================================
    PRODUCT DETAIL SLIDER
=============================================================== */
var productSliderThumbs = new Swiper('.product-slider-thumbs', {
    direction: 'horizontal',
    slidesPerView: 5,
    spaceBetween: 10,
    breakpoints: {
        560: {
            direction: 'vertical',
            slidesPerView: 1,
            spaceBetween: 0,
        },
    },
});

var productsSlider = new Swiper('.product-slider', {
    slidesPerView: 1,
    spaceBetween: 0,
    thumbs: {
        swiper: productSliderThumbs,
    },
});

/* ===============================================================
    DISABLE UNWORKED ANCHORS
=============================================================== */
document.querySelectorAll('a[href="#"]').forEach((el) => {
    el.addEventListener('click', function (e) {
        e.preventDefault();
    });
});



