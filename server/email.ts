// import nodemailer from 'nodemailer';

// interface EmailOptions {
//     to: string;
//     subject: string;
//     html: string;
// }

// const transporter = nodemailer.createTransport({
//     service: 'gmail', // Replace with your SMTP service
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// export async function sendEmail(options: EmailOptions): Promise<void> {
//     const { to, subject, html } = options;
//     await transporter.sendMail({
//         from: '"Support Team" <' + process.env.EMAIL_USER + '>',
//         to,
//         subject,
//         html,
//     });
// }