import {vi} from 'vitest';
import {SESEmailProviderContext} from '../../../../contexts/email/SESEmailProviderContext.js';
import {mockWith} from '../../helpers/mock.js';
import {TestEmailProviderContext} from '../types.js';
import {AWSConfig} from '../../../../resources/config.js';

export default class TestSESEmailProviderContext
  implements TestEmailProviderContext
{
  private client: SESEmailProviderContext;

  sendEmail: TestEmailProviderContext['sendEmail'];
  dispose: TestEmailProviderContext['dispose'];

  constructor(params: AWSConfig) {
    this.client = new SESEmailProviderContext(params);
    this.sendEmail = vi.fn(this.client.sendEmail).mockName('sendEmail');
    this.dispose = vi.fn(this.client.dispose).mockName('close');

    mockWith(this.client, this);
  }
}
