import {CustomerActivityStatus} from './customer-activity-status.enum';
import {CustomerAgentStatus} from './customer-agent-status.enum';

export interface Customer {
  CustomerId: string;
  Email: string;
  FirstName: string;
  LastName: string;
  RegisteredDate: Date;
  ReferralCode: string;
  CustomerStatus: CustomerActivityStatus;
  AgentStatus: CustomerAgentStatus;
  IsEmailVerified: boolean;
  IsPhoneVerified: boolean;
  PhoneNumber: string;
}
