import {PaymentProvidersType} from './payment-providers.enum';
export interface ProviderOptions {
  name: string;
  description: string;
  isOptional: boolean;
  isSecret: boolean;
  PaymentProvider: PaymentProvidersType;
}
