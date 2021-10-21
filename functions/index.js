const functions = require('firebase-functions');
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');

const app = express();

app.use(express.json());
app.use(
    '../Frontend/dist',
    express.static(path.join(__dirname, '../Frontend/dist')),
);

/*app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Methods', '*');
    next();
});*/

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 2,
    skip: req => req.method === 'OPTIONS',
});

// only apply to requests that begin with /api/
app.use('/send', apiLimiter);

function validateEmail(email) {
    /*eslint-disable */
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    /*eslint-enable */
    return re.test(String(email).toLowerCase());
}

app.post('/send', async (req, res) => {
    //console.log(req.body);
    let isSuccess = true;
    let isNameCorrect = true;
    let isEmailCorrect = true;
    let isMessageCorrect = true;
    const cleanMessage = sanitizeHtml(req.body.message);
    if (req.body.name === '') isNameCorrect = false;
    if (!validateEmail(req.body.email)) isEmailCorrect = false;
    if (cleanMessage === '') isMessageCorrect = false;
    if (isNameCorrect && isEmailCorrect && isMessageCorrect) {
        const output = `<p>${cleanMessage}</p>`;
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'nodemailer1234567891011@gmail.com',
                pass: 'Qwerty123#', // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        // send mail with defined transport object
        await transporter.sendMail({
            from: `${req.body.name} <nodemailer1234567891011@gmail.com>`,
            to: `${req.body.email}`, // list of receivers
            subject: 'Hello', // Subject line
            text: 'Hello world?', // plain text body
            html: output, // html body
        });
    } else {
        isSuccess = false;
    }

    res.json({
        isNameCorrect,
        isEmailCorrect,
        isMessageCorrect,
        isSuccess,
    });
});

exports.api = functions.https.onRequest(app);
