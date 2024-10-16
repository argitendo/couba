import { createTransport, createTestAccount, getTestMessageUrl } from 'nodemailer';
import logger from './logger.js';
// require('dotenv').config();
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const DEBUG = process.env.DEBUG === 'true';
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SENDER_EMAIL_USERNAME = process.env.SENDER_EMAIL_USERNAME;
const SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD;

if (!EMAIL_HOST || !EMAIL_PORT || !ADMIN_EMAIL || !SENDER_EMAIL_USERNAME || !SENDER_EMAIL_PASSWORD) {
  throw new Error('EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, ADMIN_EMAIL, SENDER_EMAIL_USERNAME and SENDER_EMAIL_PASSWORD are required')
}

/**Create Welcome Email HTML
 * @param {User} user User object
 */
function createWelcomeEmailHtml(user) {
  return `Hai ${user.fullName},<br>
<br>
Selamat datang di Couba!<br>
Terima kasih telah bergabung dengan komunitas Couba.<br>

<br>
Salam hangat,<br>
<br>
Tim Couba<br>
<br>

--<br>
<small style="color:#d4d4d4;">Email ini dikirimkan secara otomatis lewat sistem Couba</small>`;
}

/**Create Welcome Email Text
 * @param {User} user User object
 */
function createWelcomeEmailText(user) {
  return `Hai ${user.fullName},

Selamat datang di Couba!

Terima kasih telah bergabung dengan komunitas Couba.

Salam hangat,

Tim Mantra of Hope

--
Email ini dikirimkan secara otomatis lewat sistem Couba`;
}

/**Send Welcome Email */
export function sendWelcomeEmail(user) {
  const message = {
    from: SENDER_EMAIL_USERNAME,
    to: `${user.fullName} <${user.email}>`,
    subject: 'Selamat datang di Couba',
    text: createWelcomeEmailText(user),
    html: createWelcomeEmailHtml(user)
  };
  sendEmail(message);
}

/**Create Reminder Email HTML
 * @param {User} user User object
 * @param {Product} product Product object
 */
function createReminderEmailHtml(user, product) {
    return `Hai ${user.fullName},<br>
<br>
Masa aktif produk ${product.name} akan habis pada ${product.expiredDate.toDate()}<br>

<br>
Salam hangat,<br>
<br>
Tim Couba<br>
<br>

--<br>
<small style="color:#d4d4d4;">Email ini dikirimkan secara otomatis lewat sistem Couba</small>`;
}

/**Create Reminder Email Text
 * @param {User} user User object
 * @param {Product} product Product object
 */
function createReminderEmailText(user, product) {
    return `Hai ${user.fullName},

Masa aktif produk ${product.name} akan habis pada ${product.expiredDate.toDate()}

Salam hangat,

Tim Couba

--
Email ini dikirimkan secara otomatis lewat sistem Couba`;
}

/**Send Reminder Email */
export function sendReminderEmail(user, product) {
  const message = {
    from: SENDER_EMAIL_USERNAME,
    to: `${user.fullName} <${user.email}>`,
    subject: `Masa aktif ${product.name} akan segera habis`,
    text: createReminderEmailText(user, product),
    html: createReminderEmailHtml(user, product)
  };
  sendEmail(message);
}

/**Create Product Expired Email HTML
 * @param {User} user User object
 * @param {Product} product Product object
 */
function createProductExpiredEmailHtml(user, product) {
    return `Hai ${user.fullName},<br>
<br>
Masa aktif produk ${product.name} telah habis pada ${product.expiredDate.toDate()}<br>

<br>
Salam hangat,<br>
<br>
Tim Couba<br>
<br>

--<br>
<small style="color:#d4d4d4;">Email ini dikirimkan secara otomatis lewat sistem Couba</small>`;
}

/**Create Product Expired Email Text
 * @param {User} user User object
 * @param {Product} product Product object
 */
function createProductExpiredEmailText(user, product) {
    return `Hai ${user.fullName},

Masa aktif produk ${product.name} telah habis pada ${product.expiredDate.toDate()}

Salam hangat,

Tim Couba

--
Email ini dikirimkan secara otomatis lewat sistem Couba`;
}

/**Send Product Expired Email */
export function sendProductExpiredEmail(user, product) {
  const message = {
    from: SENDER_EMAIL_USERNAME,
    to: `${user.fullName} <${user.email}>`,
    subject: `Masa aktif ${product.name} telah habis`,
    text: createProductExpiredEmailText(user, product),
    html: createProductExpiredEmailHtml(user, product)
  };
  sendEmail(message);
}

/**Create Payment Success Email HTML
 * @param {Payment} payment Payment object
 */
function createPaymentSuccessEmailHtml(payment) {
    return `Hai ${payment.userFullName},<br>
<br>
Pembayaran untuk ${payment.productName} (id: ${payment.productId}) telah berhasil diterima<br>

<br>
Salam hangat,<br>
<br>
Tim Couba<br>
<br>

--<br>
<small style="color:#d4d4d4;">Email ini dikirimkan secara otomatis lewat sistem Couba</small>`;
}

/**Create Payment Success Email Text
 * @param {Payment} payment Payment object
 */
function createPaymentSuccessEmailText(payment) {
    return `Hai ${payment.userFullName},

Pembayaran untuk ${payment.productName} (id: ${payment.productId}) telah berhasil diterima

Salam hangat,

Tim Couba

--
Email ini dikirimkan secara otomatis lewat sistem Couba`;
}

/**Send Payment Success Email */
export function sendPaymentSuccessEmail(payment) {
  const message = {
    from: SENDER_EMAIL_USERNAME,
    to: `${payment.userFullName} <${payment.userEmail}>`,
    subject: `Pembayaran untuk ${payment.productName} telah berhasil`,
    text: createPaymentSuccessEmailText(payment),
    html: createPaymentSuccessEmailHtml(payment)
  };
  sendEmail(message);
}

/**Send Notification Email to Admin */
function sendNotificationEmailToAdmin(errorContext) {
  const message = {
    from: SENDER_EMAIL_USERNAME,
    to: ADMIN_EMAIL,
    subject: `Failed to send email to ${errorContext.targetEmail}`,
    text: errorContext.details,
    html: errorContext.details
  };
  let transporter = createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE,
    auth: {
      user: SENDER_EMAIL_USERNAME,
      pass: SENDER_EMAIL_PASSWORD
    }
  });
  transporter.sendMail(message, (err, info) => {
    if (err) {
      logger.error('Error occurred while trying to send email to admin. ' + err.message);
    }
    logger.info('Message sent: %s', info.messageId);
  });
}

/**Actually send the email */
function sendEmail(message) {
  return new Promise((resolve, reject) => {
    if (DEBUG) {
      // Generate SMTP service account from ethereal.email
      createTestAccount((err, account) => {
        if (err) {
          logger.error('Failed to create a testing account. ' + err.message);
          // return process.exit(1);
          reject('Failed to create a testing account. ' + err.message)
        }
        logger.info('Credentials obtained, sending message...');

        // Create a SMTP transporter object
        let transporter = createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass
          }
        });

        transporter.sendMail(message, (err, info) => {
          if (err) {
            logger.error('Error occurred while trying to send email. ' + err.message);
            // return process.exit(1);
            reject('Error occurred while trying to send email. ' + err.message)
          }

          logger.info(`Message sent: ${info.messageId}`);
          // Preview only available when sending through an Ethereal account
          logger.info(`Preview URL: ${getTestMessageUrl(info)}`);
          resolve(info);
        });
      });

    } else {
      // Create a SMTP transporter object
      let transporter = createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_SECURE,
        auth: {
          user: SENDER_EMAIL_USERNAME,
          pass: SENDER_EMAIL_PASSWORD
        }
      });
      transporter.sendMail(message, (err, info) => {
        if (err) {
          logger.error('Error occurred while trying to send email. ' + err.message);
          // return process.exit(1);
          reject('Error occurred while trying to send email. ' + err.message);
          // Send notification email to admin
          const errorContext = {
            targetEmail: message.to,
            details: `Subject: ${message.subject}\r\nError: ${err.message}`
          };
          sendNotificationEmailToAdmin(errorContext);
        }
        logger.info(`Message sent: ${info.messageId}`);
        resolve(info);
      });
    }
  });
}
