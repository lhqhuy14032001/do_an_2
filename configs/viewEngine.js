const express = require('express');
const path = require('path');
const sassMiddleware = require("node-sass-middleware");
const sass = require('node-sass') // We're adding the node-sass module

const viewEngine = (app) => {
    app.set('views', path.join('./src/', 'views'))
    app.set('view engine', 'ejs');

    app.use(express.static(path.join('./src/', 'public/')))

    // app.use(
    //     sassMiddleware({
    //         src: __dirname + '/sass',
    //         dest: __dirname + '/public',
    //         debug: true,
    //     })
    // );
}

module.exports = viewEngine;