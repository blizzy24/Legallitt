import {Injectable, ServiceUnavailableException} from '@nestjs/common';
import {SESv2Client, SendEmailCommand} from '@aws-sdk/client-sesv2';

export const NOTICE_EMAIL = Symbol('NOTICE_EMAIL');
export type NoticeEmailInput = {to: string; reference: string; pdf: Uint8Array; attemptId: string};
export interface NoticeEmailPort {assertReady?():void;send(input: NoticeEmailInput): Promise<{messageId: string; simulated: boolean}>}

/** SDK retries are disabled: SES SendEmail has no idempotency token. A timeout
 * is an UNKNOWN outcome for the admin to reconcile, never an automatic resend.
 * https://docs.aws.amazon.com/ses/latest/dg/attachments.html (read 2026-11-12). */
@Injectable()
export class SesNoticeEmail implements NoticeEmailPort {
  private readonly client = new SESv2Client({region: process.env.AWS_REGION ?? 'ap-south-1', maxAttempts: 1});
  assertReady(){if(!process.env.NOTICE_SES_FROM_EMAIL)throw new ServiceUnavailableException('SES sender is not configured. Contact the administrator; no email has been sent.');}
  async send(input: NoticeEmailInput) {
    this.assertReady();
    const from = process.env.NOTICE_SES_FROM_EMAIL;
    if (!from) throw new ServiceUnavailableException('SES sender is not configured. Contact the administrator; no email has been sent.');
    const result = await this.client.send(new SendEmailCommand({FromEmailAddress: from,
      ConfigurationSetName: process.env.NOTICE_SES_CONFIGURATION_SET || undefined,
      Destination: {ToAddresses: [input.to]}, EmailTags: [{Name: 'notice_attempt', Value: input.attemptId}],
      Content: {Simple: {Subject: {Data: `Legal Notice ${input.reference}`, Charset: 'UTF-8'},
        Body: {Text: {Data: 'Please find the legal notice attached.', Charset: 'UTF-8'}},
        Attachments: [{RawContent: input.pdf, FileName: 'Legal_Notice.pdf', ContentType: 'application/pdf', ContentDisposition: 'ATTACHMENT', ContentTransferEncoding: 'BASE64'}]}}}));
    if (!result.MessageId) throw new Error('SES did not return a message identifier. Check provider records before retrying.');
    return {messageId: result.MessageId, simulated: false};
  }
}

/** Inject only into local/test composition, never branch inside real handlers. */
export class TestNoticeEmail implements NoticeEmailPort {
  readonly sent: NoticeEmailInput[] = [];
  async send(input: NoticeEmailInput) {this.sent.push(input); return {messageId: `test-${input.attemptId}`, simulated: true};}
}
