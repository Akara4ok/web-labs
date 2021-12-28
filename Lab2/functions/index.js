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
let isTransporterFailed = false;
const mailData = functions.config()?.email;

let transporter;

try {
    transporter = nodemailer.createTransport({
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
} catch {
    isTransporterFailed = true;
}

exports.api = functions.https.onRequest((req, res) => {
    const errorMessages = [];
    const currentIp = req.headers['fastly-client-ip'];
    const currentTime = new Date();
    const currentIpUser = rateLimit.ipData.get(currentIp) ?? {
        count: 0,
        time: currentTime,
    };

    if (isTransporterFailed) {
        errorMessages.push({ message: 'Something went wrong' });
        return res.status(500).json({
            errors: errorMessages,
        });
    }

    if (
        currentTime !== currentIpUser?.time &&
        (currentIpUser?.count >= rateLimit.ipNumberCalls ||
            currentTime - currentIpUser?.time <= rateLimit.timeSeconds * 1000)
    ) {
        errorMessages.push({ message: 'Too many requests. Please try later' });
        return res.status(429).json({
            errors: errorMessages,
        });
    }
    currentIpUser.count++;
    currentIpUser.time = new Date();
    rateLimit.ipData.set(currentIp, currentIpUser);
    if (!mailData) {
        return res.status(500).json({
            errors: errorMessages,
        });
    }
    const cleanMessage = sanitizeHtml(req.body.message);
    if (!req.body.name) {
        errorMessages.push({ message: 'Enter correct name' });
    }
    if (!validateEmail(req.body.email)) {
        errorMessages.push({ message: 'Enter correct e-mail' });
    }
    if (!cleanMessage) {
        errorMessages.push({ message: 'Enter correct message' });
    }
    if (errorMessages.length) {
        return res.status(500).json({
            errors: errorMessages,
        });
    }
    const output = `<p>${cleanMessage}</p>`;

    return transporter
        .sendMail({
            from: `${req.body.name} <${mailData?.address}>`,
            to: `${req.body.email}`,
            subject: 'Hello',
            html: output,
        })
        .then(() =>
            res.json({
                data: 'Your message was successfully sent',
            }),
        )
        .catch(() => {
            errorMessages.push({ message: 'Something went wrong' });
            return res.status(500).json({
                errors: errorMessages,
            });
        });
});
