import {Injectable} from '@nestjs/common';
import {ChangePasswordCommand, CognitoIdentityProviderClient, GlobalSignOutCommand} from '@aws-sdk/client-cognito-identity-provider';

/** D-21: the only Cognito calls the account area makes, behind a port so tests
 *  never touch a real user pool or a real credential. */
export const ACCOUNT_COGNITO = Symbol('ACCOUNT_COGNITO');
export interface AccountCognitoPort {
  changePassword(accessToken: string, previous: string, next: string): Promise<void>;
  globalSignOut(accessToken: string): Promise<void>;
}
@Injectable()
export class CognitoAccountAdapter implements AccountCognitoPort {
  private readonly client = new CognitoIdentityProviderClient({region: 'ap-south-1'});
  async changePassword(accessToken: string, previous: string, next: string) {
    await this.client.send(new ChangePasswordCommand({AccessToken: accessToken, PreviousPassword: previous, ProposedPassword: next}));
  }
  async globalSignOut(accessToken: string) {
    await this.client.send(new GlobalSignOutCommand({AccessToken: accessToken}));
  }
}
