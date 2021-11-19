const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');

const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function validateEmail(email) {
    return re.test(String(email).toLowerCase());
}

const rateLimit = {
    ipNumberCalls: 5,
    timeSeconds: 30,
    ipData: new Map(),
};

const mailData = functions.config()?.email;

const transporter = nodemailer.createTransport({
    host: mailData?.host,
    port: mailData?.port,
    secure: false,
    auth: {
        user: mailData?.address,
        pass: mailData?.pass,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

exports.api = functions.https.onRequest((req, res) => {
    const messages = [];
    let isSuccess = true;
    const currentIp = req.headers['fastly-client-ip'];
    const currentTime = new Date();
    const currentIpUser = rateLimit.ipData.get(currentIp) ?? {
        count: 0,
        time: currentTime,
    };
    if (
        currentIpUser.count &&
        (currentIpUser.count >= rateLimit.ipNumberCalls ||
            currentTime - currentIpUser.time <= rateLimit.timeSeconds * 1000)
    ) {
        isSuccess = false;
        messages.push('Too many requests. Please try later');
        res.status(429).json({
            isSuccess,
            messages,
        });
        return;
    }
    currentIpUser.count += 1;
    currentIpUser.time = new Date();
    rateLimit.ipData.set(currentIp, currentIpUser);
    if (!mailData) {
        res.status(500).json({
            isSuccess,
            messages,
        });
        return;
    }
    const cleanMessage = sanitizeHtml(req.body.message);
    isSuccess = true;
    if (!req.body.name) {
        messages.push('Enter correct name');
        isSuccess = false;
    }
    if (!validateEmail(req.body.email)) {
        messages.push('Enter correct e-mail');
        isSuccess = false;
    }
    if (!cleanMessage) {
        messages.push('Enter correct message');
        isSuccess = false;
    }
    if (!isSuccess) {
        res.json({
            isSuccess,
            messages,
        });
        return;
    }
    const output = `<p>${cleanMessage}</p>`;

    transporter
        .sendMail({
            from: `${req.body.name} <${functions.config().email.address}>`,
            to: `${req.body.email}`,
            subject: 'Hello',
            html: output,
        })
        .then(() => {
            messages.push('Your message was successfully sent');
            res.json({
                isSuccess,
                messages,
            });
        })
        .catch(() => {
            res.status(500).json({
                isSuccess,
                messages,
            });
        });
});
