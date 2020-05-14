import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AgmCoreModule} from '@agm/core';
import {BeautifiedPaginatorComponent} from './beautified-paginator/beautified-paginator.component';
import {FormControlErrorMessageComponent} from './form-control-error-message-component/form-control-error-message.component';
import {PaginationContainerComponent} from './pagination-container/pagination-container.component';
import {ErrorMessageComponent} from './error-message/error-message.component';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule} from '@angular/material-moment-adapter';
import {ConfirmationDialogComponent} from './confirmation-dialog/confirmation-dialog.component';
// directives
import {CopyToClipboardDirective} from './directives/copy-to-clipboard.directive';
// pipes
import {TokenPipe} from './pipes/token.pipe';
import {HideRulesPipe} from './pipes/hide-rules.pipe';
import {HighlightPipe} from './pipes/highlight.pipe';
import {HeaderMenuComponent} from './header-menu/header-menu.component';
import {FileSizePipe} from './pipes/file-size.pipe';
import {LanguageSwitcherComponent} from './language-switcher/language-switcher.component';
import {LocationMapComponent} from './location-map/location-map.component';

@NgModule({
  declarations: [
    BeautifiedPaginatorComponent,
    FormControlErrorMessageComponent,
    ErrorMessageComponent,
    ConfirmationDialogComponent,
    PaginationContainerComponent,
    // directives
    CopyToClipboardDirective,
    // pipes
    FileSizePipe,
    HideRulesPipe,
    TokenPipe,
    HighlightPipe,
    HeaderMenuComponent,
    LanguageSwitcherComponent,
    LocationMapComponent,
  ],
  imports: [
    CommonModule,
    // Material
    MatButtonModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatFormFieldModule,
    MatGridListModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatMomentDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    AgmCoreModule.forRoot({
      apiKey: '',
    }),
  ],
  exports: [
    FormControlErrorMessageComponent,
    ErrorMessageComponent,
    ConfirmationDialogComponent,
    PaginationContainerComponent,
    // directives
    CopyToClipboardDirective,
    // pipes
    FileSizePipe,
    TokenPipe,
    HighlightPipe,
    HideRulesPipe,
    // Material
    MatButtonModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatFormFieldModule,
    MatGridListModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatMomentDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    HeaderMenuComponent,
    LanguageSwitcherComponent,
    LocationMapComponent,
  ],
  entryComponents: [ConfirmationDialogComponent],
  providers: [{provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}}],
})
export class SharedModule {}
