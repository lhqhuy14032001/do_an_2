const jwt = require('jsonwebtoken')
require('dotenv').config()
const common = {
    runQuery: (connection, sqlQuery, data) => {
        return new Promise((resolve, reject) => {
            if (connection) {
                if (sqlQuery) {
                    if (data) {
                        connection.query(sqlQuery, data, function (error, result, fields) {
                            // connection.end(); 
                            // end connection
                            if (error) {
                                // throw error;
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        })
                    } else {
                        connection.query(sqlQuery, function (error, result, fields) {
                            // connection.end(); 
                            // end connection
                            if (error) {
                                // throw error;
                                reject(error);
                                // connection.end();
                            } else {
                                resolve(result);
                            }
                        })
                    }
                } else {
                    reject('Missing sql query !!!!')
                    connection.end();
                }
            } else {
                reject('Can not connect to database');
            }
        });
    },
    generateToken: (payload, expiresIn) => {
        return jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_KEY,
            {
                expiresIn: expiresIn
            }
        )
    },
    generateRefreshToken: (payload, expiresIn) => {
        return jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_KEY,
            {
                expiresIn: expiresIn
            }
        )
    },
    getCookie: (req, name) => {
        // split the cookie string into individual name=value pairs
        try {
            const cookieArr = req.headers.cookie.split(";");
            // loop through the array to find the cookie
            for (let i = 0; i < cookieArr.length; i++) {
                const cookiePair = cookieArr[i].split("=");
                // remove whitespace at the beginning of the cookie name
                if (name == cookiePair[0].trim()) {
                    // decode the cookie value and return it
                    return decodeURIComponent(cookiePair[1]);
                }
            }
            // return null if cookie not found
            return null;
        } catch (error) {
            console.log(error);
        }

    },
    getRowToPaging: (connection, table) => {
        try {
            let sql = `SELECT COUNT(id) FROM ${table};`
            let rows = common.runQuery(connection, sql)
            return rows
        } catch (error) {
            console.log(error)
        }
    }

}
module.exports = common;
