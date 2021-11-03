/*eslint-disable */
const functions = require('firebase-functions');
/*eslint-enable */
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');

function validateEmail(email) {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const rateLimit = {
    ipNumberCalls: 5,
    timeSeconds: 30,
    ipData: new Map(),
};

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

exports.api = functions.https.onRequest(async (req, res) => {
    const messages = [];
    let isSuccess = [];
    const currentIp = req.headers['fastly-client-ip'];
    let currentIpUser = {};
    const currentTime = new Date();

    currentIpUser = rateLimit.ipData.get(currentIp);

    if (currentIpUser === undefined) {
        currentIpUser = { count: 0, time: currentTime };
    }

    if (
        currentIpUser.count !== 0 &&
        (currentIpUser.count + 1 > rateLimit.ipNumberCalls ||
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
    if (!isSuccess) return;

    const output = `<p>${cleanMessage}</p>`;

    await transporter.sendMail({
        from: `${req.body.name} <${functions.config().email.address}>`,
        to: `${req.body.email}`,
        subject: 'Hello',
        text: 'Hello world?',
        html: output,
    });
    messages.push('Your message was successfully sent');
    res.json({
        isSuccess,
        messages,
    });
});
