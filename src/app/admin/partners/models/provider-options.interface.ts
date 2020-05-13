import {PaymentProvidersType} from './payment-providers-type.enum';
import {ProviderProperties} from './provider-properties.interface';
export interface ProviderOptions {
  Properties: ProviderProperties[];
  PaymentProvider: PaymentProvidersType;
}
