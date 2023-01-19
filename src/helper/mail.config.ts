import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
const mailAccount = {
    user: 'heeca@mail.ru',
    pass: 'jvKMKAkJni1RTmKFDLiu',
};
export const getMailConfig = async (): Promise<any> => {
    return {
        transport: {
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: mailAccount.user, // generated ethereal user
                pass: mailAccount.pass, // generated ethereal password
            },
        },
        //transport: 'smtps://heeca@mail.ru:jvKMKAkJni1RTmKFDLiu@smtp.mail.ru',
        defaults: {
            from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
            adapter: new EjsAdapter(),
            options: {
                strict: false,
            },
        },
    };
};
