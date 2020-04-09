# OpenMAVN Backoffice

Firstly install node modules by command:  
npm ci  
This command uses package-lock.json file with necessary versions.

## Development server

To run locally execute command `npm run serve-en`, the available commands are in package.json file inside scripts section.
Navigate to `http://localhost:4200/en`. The app will automatically reload if you change any of the source files.

## i18n

To run locally the german version execute command `npm run serve-en` and then navigate to `http://localhost:4201/de`.

To append new translations make sure you put attribute i18n as described here (https://angular.io/guide/i18n).  
Then update file with message which should be translated:  
ng xi18n --i18n-format=xlf --i18n-locale en-US --out-file messages.generated.xlf --output-path locale  
Copy new items to messages.de-DE.generated.xlf and then translate them.  
In result new tags `<target>` should appear: e.g. `<target state="translated">Kunden</target>`

Note: to compare easier the files `messages.generated.xlf` and `messages.de-DE.generated.xlf` you can clear extra tags with Notepad++.

Find and replace by regex to clear extra tags:  
(?s-i)<context-group (purpose="location"){1}>.+?</context-group>

When click Replace all, it hangs out for a couple of seconds and then finishes.

Then install plugin XML Tools and format with "Linearize XML", then by "Pretty print (XML only - with line breaks).

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# Optimizing js files for WAF

## Custom webpack package for Angular 7

Install specific version:
npm i --save-dev --save-exact @angular-builders/custom-webpack@7.5.2

Read:
https://github.com/just-jeb/angular-builders/blob/7.x.x/packages/custom-webpack/README.md

https://webpack.js.org/plugins/limit-chunk-count-plugin/
