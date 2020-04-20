# OpenMAVN Backoffice

Firstly install node modules by command:  
npm ci  
This command uses package-lock.json file with necessary versions.

## Development server

To run locally execute command `npm run serve-en`, the available commands are in package.json file inside scripts section.
Navigate to `http://localhost:4200/en`. The app will automatically reload if you change any of the source files.  
Pay attention to file `nginx/env-config.json` which contains settings required for application including api url `AdminApiGatewayUrl`. This file is downloading at the moment of application start.

## i18n

To run locally the german version execute command `npm run serve-de` and then navigate to `http://localhost:4201/de`.

To append new translations make sure you put attribute i18n as described here (https://angular.io/guide/i18n).  
Then update file with message(s) which should be translated:  
`npm run i18n`  
Now you can compare the files `messages.generated.xlf` and `messages.de-DE.generated.xlf` and copy new untranslated strings.  
Then translate new strings in translation tools or manually by addings tags `<target>`.  
So in result should appear: e.g. `<target state="translated">Kunden</target>`

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the production build. The build artifacts will be stored in the `dist/` directory.

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
