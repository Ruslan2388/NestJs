import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {}
    async sendEmail(email: string, subject: string, confirmationCode: string) {
        try {
            this.mailerService.sendMail({
                from: '"RUSEL" <it-project-inctagram2000@mail.ru>', // sender address
                to: email,
                subject: subject,
                html: `<h1>Thank for your registration</h1>
                        <p>To finish registration please follow the link below:
                             <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
                        </p>`,
            });
            console.log('email send');
        } catch (e) {
            console.log(e);
            console.log('nebmylos');
            return true;
        }
    }

    async sendMailRecoveryPassword(email: string, subject: string, NewRecoveryCode: string) {
        this.mailerService.sendMail({
            from: '"RUSEL" <it-project-inctagram2000@mail.ru>', // sender address
            to: email,
            subject: subject,
            html: `<h1>Thank for your registration</h1>
                        <p>To finish registration please follow the link below:
                                 <a href='https://somesite.com/confirm-email?code=${NewRecoveryCode}'>recovery password</a>
                        </p>`,
        });
    }
}
