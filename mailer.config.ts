import { MailerOptions } from '@nestjs-modules/mailer';

const mailerConfig: MailerOptions = {
  transport: {
    host: 'localhost',
    port: 507,
    secure: false,
  },
};

export default mailerConfig;
