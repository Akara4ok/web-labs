/*eslint-disable */
const functions = require('firebase-functions');
/*eslint-enable */
const nodemailer = require('nodemailer');
//const rateLimit = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');

/*const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 2,
    skip: req => req.method === 'OPTIONS',
});*/

function validateEmail(email) {
    /*eslint-disable */
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    /*eslint-enable */
    return re.test(String(email).toLowerCase());
}

exports.api = functions.https.onRequest(async (req, res) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Allow-Headers': '*',
    };

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        //return;
    } else {
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
                host: functions.config().email.host,
                port: 587,
                secure: false,
                auth: {
                    user: functions.config().email.address,
                    pass: functions.config().email.pass,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });

            await transporter.sendMail({
                from: `${req.body.name} <${functions.config().email.address}>`,
                to: `${req.body.email}`,
                subject: 'Hello',
                text: 'Hello world?',
                html: output,
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
    }
});
