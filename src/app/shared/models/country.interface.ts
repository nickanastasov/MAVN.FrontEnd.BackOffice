export interface Country {
  name: string;
  alpha2Code: string;
  alpha3Code: string;
  currencies: {code: string}[];
  flag: string;
  isHidden: boolean;
}
