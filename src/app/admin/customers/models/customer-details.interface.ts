import {Customer} from './customer.interface';
import {CustomerWalletActivityStatus} from './customer-wallet-activity-status.enum';

export interface CustomerDetails extends Customer {
  WalletStatus: CustomerWalletActivityStatus;
}
