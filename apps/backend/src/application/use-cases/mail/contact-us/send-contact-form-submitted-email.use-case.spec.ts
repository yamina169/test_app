import { SendContactFormSubmittedEmailUseCase } from './send-contact-form-submitted-email.use-case';
import { SendContactFormSubmittedEmailDto } from '@application/dto/mail/send-contact-form-submitted-email.dto';
import { MailTemplateKey } from '@domain/enums/mail/mail-template-key.enum';
import { SystemEmailSender } from '@domain/enums/mail/system-email-sender.enum';
import { MailerPort } from '@domain/interfaces/mailer.port';
import { emailBranding } from '@domain/constants/email-branding';

describe('SendContactFormSubmittedEmailUseCase', () => {
  let useCase: SendContactFormSubmittedEmailUseCase;
  let mailerMock: jest.Mocked<MailerPort>;

  const input: SendContactFormSubmittedEmailDto = {
    email: 'user@example.com',
    locale: 'en',
    subject: 'Need help with my account',
    reference: 'REF-2026-001',
  };

  beforeEach(() => {
    mailerMock = {
      sendTemplatedEmail: jest.fn(),
    } as jest.Mocked<MailerPort>;

    useCase = new SendContactFormSubmittedEmailUseCase(mailerMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should send the contact form confirmation email with the correct payload', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-13T10:00:00.000Z'));

    await useCase.execute(input);

    const sendTemplatedEmailMock = mailerMock.sendTemplatedEmail;

    expect(sendTemplatedEmailMock).toHaveBeenCalledTimes(1);
    expect(sendTemplatedEmailMock).toHaveBeenCalledWith({
      to: input.email,
      locale: input.locale,
      senderKey: SystemEmailSender.CONTACT,
      templateKey: MailTemplateKey.CONTACT_US_CONFIRMATION,
      context: {
        subject: input.subject,
        reference: input.reference,
        branding: emailBranding[input.locale],
        year: 2026,
      },
    });
  });

  it('should use branding matching the input locale', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-13T10:00:00.000Z'));

    const frenchInput: SendContactFormSubmittedEmailDto = {
      ...input,
      locale: 'fr',
    };

    await useCase.execute(frenchInput);

    const sendTemplatedEmailMock = mailerMock.sendTemplatedEmail;

    const calledWith = sendTemplatedEmailMock.mock.calls[0][0];

    expect(calledWith.locale).toBe('fr');
    expect(calledWith.context).toMatchObject({
      year: 2026,
      branding: emailBranding.fr,
    });
  });

  it('should propagate the error when sending the email fails', async () => {
    const error = new Error('SMTP failure');

    const sendTemplatedEmailMock = mailerMock.sendTemplatedEmail;

    sendTemplatedEmailMock.mockRejectedValue(error);

    await expect(useCase.execute(input)).rejects.toThrow('SMTP failure');

    expect(sendTemplatedEmailMock).toHaveBeenCalledTimes(1);
  });
});
