import nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'
dotenv.config()

let sendEmail = async (email,message) => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    try {

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com", // hostname
            secureConnection: false, // TLS requires secureConnection to be false
            port: 587, // port for secure SMTP
            tls: {
                ciphers:'SSLv3'
             },
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: "ailed.riveraperales@outlook.com", // sender address
            to: email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: message, // plain text body
            html: "<b>"+message+"</b>", // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } catch (e) {
        console.log(e)
    }

}

export default {
    sendEmail
}