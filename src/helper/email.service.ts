import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

const mailAccount = {
    user: 'heeca@mail.ru',
    pass: 'YFjuyXsN0yUu9S7vTigR',
};

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {}
    async sendEmail(email: string, subject: string, confirmationCode: string) {
        this.mailerService.sendMail({
            from: '"RUSEL" <heeca@mail.ru>', // sender address
            to: email,
            subject: subject,
            html: `<h1>Thank for your registration</h1>
                        <p>To finish registration please follow the link below:
                             <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
                        </p>`,
        });
        // const transporter = nodemailer.createTransport({
        //     host: 'smtp.mail.ru',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: mailAccount.user, // generated ethereal user
        //         pass: mailAccount.pass, // generated ethereal password
        //     },
        // });
        // transporter.sendMail({
        //     from: '"RUSEL" <heeca@mail.ru>', // sender address
        //     to: email, // list of receivers
        //     subject: subject, // Subject line
        //     html: `<h1>Thank for your registration</h1>
        //                 <p>To finish registration please follow the link below:
        //                      <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
        //                 </p>`, // html body
        // });
        // // console.log(this.mailerService);
        // // await this.mailerService.sendMail({
        // //     to: email, // list of receivers
        // //     from: 'heeca@mail.ru', // sender address
        // //     subject: subject, // Subject line
        // //     text: 'welcome', // plaintext body
        // //     html: `<h1>Thank for your registration</h1>
        // //                 <p>To finish registration please follow the link below:
        // //                      <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
        // //                 </p>`, // HTML body content
        // // });
    }

    async sendMailRecoveryPassword(email: string, subject: string, NewRecoveryCode: string) {
        this.mailerService.sendMail({
            from: '"RUSEL" <heeca@mail.ru>', // sender address
            to: email,
            subject: subject,
            html: `<h1>Thank for your registration</h1>
                        <p>To finish registration please follow the link below:
                             <a href='https://somesite.com/confirm-email?code=${NewRecoveryCode}'>complete registration</a>
                        </p>`,
        });
    }
}
