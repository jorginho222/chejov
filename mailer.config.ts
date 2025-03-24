import { MailerOptions } from '@nestjs-modules/mailer';

const mailerConfig: MailerOptions = {
  transport: {
    host: 'smtp.ethereal.email',
    port: 507,
    secure: false,
  },
};

export default mailerConfig;
