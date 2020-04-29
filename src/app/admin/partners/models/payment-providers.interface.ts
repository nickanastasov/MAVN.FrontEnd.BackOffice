import {PaymentProvidersType} from './payment-providers.enum';
import {ProviderOptions} from './provider-options.interface';
export interface PaymentProviders {
  providerProperties: ProviderOptions[];
  paymentProvider: PaymentProvidersType;
}
