/*eslint-disable */
const functions = require('firebase-functions');
/*eslint-enable */
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');
//const { firebaseConfig } = require('firebase-functions');

const app = express();

app.use(express.json());
app.use(
    '../Frontend/dist',
    express.static(path.join(__dirname, '../Frontend/dist')),
);

app.use((req, res, next) => {
    res.set(
        'Access-Control-Allow-Origin',
        'https://mail-sender-10d73--pr6-lab2-f0t2q7r2.web.app',
    );
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Methods', '*');
    next();
});

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
                user: `${functions.email.address.secret}`,
                pass: `${functions.email.pass.secret}`,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        // send mail with defined transport object
        await transporter.sendMail({
            from: `${req.body.name} <${functions.email.address.secret}>`,
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

//app.listen(3000, console.log(`Server started`));

exports.api = functions.https.onRequest(app);
