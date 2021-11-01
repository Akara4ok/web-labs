/*eslint-disable */
const functions = require('firebase-functions');
/*eslint-enable */
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');

function validateEmail(email) {
    /*eslint-disable */
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    /*eslint-enable */
    return re.test(String(email).toLowerCase());
}

const rateLimit = {
    ipNumberCalls: 5,
    timeSeconds: 30,
    ipData: new Map(),
};

exports.api = functions.https.onRequest(async (req, res) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000,
        'Access-Control-Allow-Headers': '*',
    };

    if (req.method === 'OPTIONS') {
        res.writeHead(200, headers);
        res.end();
        return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    let isSuccess = true;
    let isNameCorrect = true;
    let isEmailCorrect = true;
    let isMessageCorrect = true;

    const currentIp = req.headers['fastly-client-ip'];
    let currentIpUser = {};
    const currentTime = new Date();
    if (rateLimit.ipData.get(currentIp) === undefined) {
        rateLimit.ipData.set(currentIp, { count: 1, time: currentTime });
    } else {
        currentIpUser = rateLimit.ipData.get(currentIp);
        if (
            currentIpUser.count + 1 > rateLimit.ipNumberCalls ||
            currentTime - currentIpUser.time <= rateLimit.timeSeconds * 1000
        ) {
            res.status(429).json({
                isNameCorrect,
                isEmailCorrect,
                isMessageCorrect,
                isSuccess: false,
            });
            return;
        }
    }
    currentIpUser = rateLimit.ipData.get(currentIp);
    currentIpUser.count += 1;
    currentIpUser.time = new Date();
    rateLimit.ipData.set(currentIp, currentIpUser);

    const cleanMessage = sanitizeHtml(req.body.message);
    if (req.body.name === '') isNameCorrect = false;
    if (!validateEmail(req.body.email)) isEmailCorrect = false;
    if (cleanMessage === '') isMessageCorrect = false;
    if (isNameCorrect && isEmailCorrect && isMessageCorrect) {
        const output = `<p>${cleanMessage}</p>`;
        const transporter = nodemailer.createTransport({
            host: functions.config().email.host,
            port: functions.config().email.port,
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
});