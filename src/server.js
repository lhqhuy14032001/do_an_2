const express = require('express');
const webRoute = require('./routes/web');
const authRoute = require('./routes/auth');
const adminRoute = require('./routes/adminRoute');
const viewEngine = require('../configs/viewEngine');
const middleware = require('./middlewares/authorization');


require('dotenv').config();

const app = express();

// use req.body
app.use(express.json())
app.use(express.urlencoded({extended: true}))


//config view
viewEngine(app);


//route
app.use('/auth', authRoute);
app.use('/admin', middleware.verifyToken, adminRoute);
app.use('/', webRoute);


// connnect db
const connection = require('../configs/db')


port = process.env.PORT || 3001;


app.listen(port, () => {
    try {
        connection
        console.log('Connected');
        console.log(`Server is running on ${port}`);
    } catch (error) {
        console.log(`Something is wrong ${error}`);
    }
})
