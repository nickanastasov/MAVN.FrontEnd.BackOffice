import {AbstractControl, ValidatorFn, AsyncValidatorFn} from '@angular/forms';
import {TOKENS_INPUT_MAX_NUMBER} from 'src/app/core/constants/const';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {PasswordValidationRules} from '../models/password-validation.interface';

export function IntegerRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (!control.value) {
      return null;
    }

    const value = parseInt((control.value || '').toString().trim(), 0);
    return value < min || value > max ? {intrange: true} : null;
  };
}

export function LengthValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (!control.value) {
      return null;
    }

    const value = (control.value || '').trim();
    return value.length < min || value.length > max ? {length: true} : null;
  };
}

export function IntegerValidator(control: AbstractControl): {[key: string]: any} | null {
  return control.value && control.value % 1 !== 0 ? {integer: true} : null;
}

export function MoneyFormatValidator(): ValidatorFn {
  const moneyFormatRegex = /^[-]?\d+\.?\d*$/;

  return (control: AbstractControl): {[key: string]: any} | null => {
    const value: string = control.value ? control.value.toString() : null;

    if (!value) {
      return null;
    }

    const result = moneyFormatRegex.exec(value);
    return result ? null : {moneyFormat: true};
  };
}

export function MoneyOnlyPositiveValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const value: string = (control.value || '').toString();

    if (!value) {
      return null;
    }

    return value.startsWith('-') ? {onlyPositive: true} : null;
  };
}

export function MoneyMinZeroValidator(): ValidatorFn {
  const expression = /^(\d+)\.?(\d*)$/;
  const notValid = {moneyMinZero: true};

  return (control: AbstractControl): {[key: string]: any} | null => {
    const value: string = control.value ? control.value.toString() : null;

    if (!value) {
      return null;
    }

    if (value.startsWith('-')) {
      return notValid;
    }

    const result = expression.exec(value);
    if (!result) {
      return notValid;
    }

    const integerPart = result[1];
    const isValidIntegerPart = integerPart >= '0'.repeat(integerPart.length);
    if (!isValidIntegerPart) {
      return notValid;
    }

    const fractionalPart = result[2];
    const isValidFractionalPart = fractionalPart.length === 0 || fractionalPart >= '0'.repeat(fractionalPart.length);
    if (!isValidFractionalPart) {
      return notValid;
    }

    return null;
  };
}

export function MoneyMinMoreZeroValidator(): ValidatorFn {
  const expression = /^(\d+)\.?(\d*)$/;
  const notValid = {moneyMinMoreZero: true};

  return (control: AbstractControl): {[key: string]: any} | null => {
    const value: string = control.value ? control.value.toString() : null;

    if (!value) {
      return null;
    }

    const result = expression.exec(value);
    if (!result) {
      return notValid;
    }

    const integerPart = result[1];
    if (integerPart > '0'.repeat(integerPart.length)) {
      return null;
    }

    const fractionalPart = result[2];
    return fractionalPart.length === 0 || fractionalPart === '0'.repeat(fractionalPart.length) ? notValid : null;
  };
}
export function MoneyMaxNumberValidator(): ValidatorFn {
  const expression = /^(\d+)\.?(\d*)$/;
  const maxNumber = TOKENS_INPUT_MAX_NUMBER;
  const notValid = {moneyMaxNumber: true};

  return (control: AbstractControl): {[key: string]: any} | null => {
    const value: string = control.value ? control.value.toString() : null;

    if (!value) {
      return null;
    }

    const result = expression.exec(value);
    if (!result) {
      return notValid;
    }

    const integerPart = result[1].replace(/^0+(?=\d)/, ''); // trim leading zeros
    if (integerPart.length > maxNumber.toString().length) {
      return notValid;
    }

    if (integerPart.length === maxNumber.toString().length) {
      if (integerPart > maxNumber.toString()) {
        return notValid;
      } else if (integerPart === maxNumber.toString()) {
        const fractionalPart = result[2];
        const isFractionalPartGreaterThanZero = fractionalPart.length !== 0 && fractionalPart > '0'.repeat(fractionalPart.length);

        if (isFractionalPartGreaterThanZero) {
          return notValid;
        }
      }
    }

    return null;
  };
}

export function AccuracyValidator(accuracy: number): ValidatorFn {
  const expression = /^\d*\.(\d*)$/;

  return (control: AbstractControl): {[key: string]: any} | null => {
    const value: string = control.value ? control.value.toString() : null;

    if (!value) {
      return null;
    }

    const result = expression.exec(value);
    return result && result[1].length > accuracy ? {accuracy: true} : null;
  };
}

export function FileSizeValidator(maxSizeInKB: number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    let isValid = true;

    const file = control.value as File;

    if (!file) {
      return null;
    }

    if (file.size === 0 || file.size > maxSizeInKB * 1024) {
      isValid = false;
    }

    return isValid ? null : {fileSize: true};
  };
}

export function FileExtensionValidator(validExtensions: string): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    let isValid = true;

    const file = control.value as File;

    if (!file) {
      return null;
    }

    const extension = getExtension(file.name);

    if (!extension) {
      isValid = false;
    }

    isValid = validExtensions.indexOf(`.${extension.toLowerCase()}`) >= 0;

    return isValid ? null : {fileExtension: true};
  };
}

function asyncDimensions(file: any): Observable<{[key: string]: any}> {
  return new Observable(observer => {
    const _URL = window.URL;
    const image = new Image();

    image.onload = (event: any) => {
      const eventTarget = event.target;
      const fileDimensions = {
        width: eventTarget.width,
        height: eventTarget.height
      };

      // observable execution
      observer.next(fileDimensions);
      observer.complete();
    };
    image.src = _URL.createObjectURL(file);
  });
}

export function FileDimensionsValidator(minWidthInPixels: number, minHeightInPixels: number): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{[key: string]: any} | null> => {
    let isValid = true;

    const file = control.value as File;

    if (!file) {
      return of(null);
    }

    return asyncDimensions(file).pipe(
      map(fileDimensions => {
        isValid = fileDimensions.width >= (minWidthInPixels || 0) && fileDimensions.height >= (minHeightInPixels || 0);
        return isValid ? null : {fileDimensions: true};
      })
    );
  };
}

export function getExtension(fileName: string): string {
  return fileName ? fileName.split('.').pop() : '';
}

// aligned with regex from backend
// public const string EmailValidationPattern =
//               @"\A(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)\Z";
// unfortunately the above expression does not cover fully all cases
// so regex is taken from fluent validation EmailValidator with added RegexOptions.IgnoreCase
// from here https://github.com/JeremySkinner/FluentValidation/blob/master/src/FluentValidation/Validators/EmailValidator.cs
//                   ((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-||_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+([a-z]+|\d|-|\.{0,1}|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])?([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))
const EmailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-||_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+([a-z]+|\d|-|\.{0,1}|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])?([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
const TopLevelDomainRegex = /^.{2,}$/;

export const isValidEmail = (email: string): boolean => {
  let result = EmailRegex.test(email);

  if (result) {
    // check Top Level Domain
    const parts = email.split('@');
    const endParts = parts[1].split('.');
    const lastDomain = endParts.reverse()[0];

    result = TopLevelDomainRegex.test(lastDomain);
  }

  return result;
};

export function EmailValidator(control: AbstractControl): {[key: string]: any} | null {
  const value = (control.value || '').toString();

  return isValidEmail(value) ? null : {email: {valid: false, value: control.value}};
}

export function PhoneNumberValidator(control: AbstractControl): {[key: string]: any} | null {
  const value = (control.value || '').toString();
  const expression = /^[0-9 A-Z a-z #;,()+*-]{1,30}$/g;
  const result = expression.test(value);

  return result ? null : {phone: {valid: false, value: control.value}};
}

export function OnlyLettersValidator(control: AbstractControl): {[key: string]: any} | null {
  const value = (control.value || '').toString();
  const expression = /^((?![1-9!@#$%^&*()_+{}|:\""?></,;[\]\\=~]).)+$/;
  const result = expression.test(value);

  return result ? null : {text: {valid: false, value: control.value}};
}

export function PasswordValidator(rules: PasswordValidationRules): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const value: string = (control.value || '').toString();
    let isValid = value ? true : false;
    let customErrors: any = {};
    const valueChars = value.split('');

    if (!hasEnoughLowerCaseLetter()) {
      customErrors.invalidLowerCase = true;
    }
    if (!hasEnoughUpperCaseLetter()) {
      customErrors.invalidUpperCase = true;
    }
    if (!hasEnoughDigits()) {
      customErrors.invalidDigits = true;
    }
    if (!hasEnoughSpecialSymbols()) {
      customErrors.invalidSpecialSymbols = true;
    }
    if (!noWhiteSpaceIfNotAllowed()) {
      customErrors.invalidWhiteSpace = true;
    }

    if (isValid) {
      isValid = hasEnoughLowerCaseLetter();
    }

    if (isValid) {
      isValid = hasEnoughUpperCaseLetter();
    }

    if (isValid) {
      isValid = hasEnoughDigits();
    }

    if (isValid) {
      isValid = hasEnoughSpecialSymbols();
    }

    if (isValid) {
      isValid = noWhiteSpaceIfNotAllowed();
    }

    return isValid ? null : {invalidPasswordFormat: true, ...customErrors};

    function hasEnoughLowerCaseLetter() {
      const charsCount = valueChars.reduce((count, char) => {
        if (isNaN((char as any) * 1) && char === char.toLowerCase() && char !== char.toUpperCase()) {
          count++;
        }

        return count;
      }, 0);

      return charsCount >= rules.MinLowerCase;
    }

    function hasEnoughUpperCaseLetter() {
      const charsCount = valueChars.reduce((count, char) => {
        if (isNaN((char as any) * 1) && char === char.toUpperCase() && char !== char.toLowerCase()) {
          count++;
        }

        return count;
      }, 0);

      return charsCount >= rules.MinUpperCase;
    }

    function hasEnoughDigits() {
      const charsCount = valueChars.reduce((count, char) => {
        if (!isNaN((char as any) * 1)) {
          count++;
        }

        return count;
      }, 0);

      return charsCount >= rules.MinNumbers;
    }

    function hasEnoughSpecialSymbols() {
      const charsCount = valueChars.reduce((count, char) => {
        if (rules.AllowedSpecialSymbols.indexOf(char) > -1) {
          count++;
        }

        return count;
      }, 0);

      return charsCount >= rules.MinSpecialSymbols;
    }

    function noWhiteSpaceIfNotAllowed() {
      const hasWhiteSpace = valueChars.some(char => {
        return char === ' ';
      });

      if (!rules.AllowWhiteSpaces && hasWhiteSpace) {
        return false;
      }

      return true;
    }
  };
}

export function PasswordEqualledValidator(control: AbstractControl): {[key: string]: any} | null {
  const password = control.get('Password');
  const repeatPassword = control.get('RepeatPassword');

  const error = password && repeatPassword && password.value !== repeatPassword.value ? {passwordNotEqualled: true} : null;

  return error;
}
