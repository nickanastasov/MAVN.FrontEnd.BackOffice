import {CustomerPublicWalletAddressStatus} from './customer-public-wallet-address-status.enum';

export interface CustomerPublicWalletAddressResponse {
  PublicAddress: string;
  Status: CustomerPublicWalletAddressStatus;
}
