export interface PasswordValidationRules {
  MinLength: number;
  MaxLength: number;
  MinUpperCase: number;
  MinLowerCase: number;
  MinNumbers: number;
  AllowedSpecialSymbols: string;
  MinSpecialSymbols: number;
  AllowWhiteSpaces: boolean;
}
