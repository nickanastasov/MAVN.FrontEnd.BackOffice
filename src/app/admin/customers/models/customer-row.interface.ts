import {CustomerActivityStatus} from './customer-activity-status.enum';
import {CustomerAgentStatus} from './customer-agent-status.enum';

export class CustomerRow {
  CustomerId: string;
  Email: string;
  IsEmailVerified: boolean;
  PhoneNumber: string;
  IsPhoneVerified: boolean;
  FirstName: string;
  LastName: string;
  RegisteredDate: Date;
  ReferralCode: string;
  CustomerStatus: CustomerActivityStatus;
  CustomerAgentStatus: CustomerAgentStatus;
}
