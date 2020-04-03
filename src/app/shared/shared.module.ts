import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
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
  MatTooltipModule
} from '@angular/material';
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
import {HighlightPipe} from './pipes/highlight.pipe';
import {HeaderMenuComponent} from './header-menu/header-menu.component';
import {FileSizePipe} from './pipes/file-size.pipe';

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
    TokenPipe,
    HighlightPipe,
    HeaderMenuComponent
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
    MatTooltipModule
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
    HeaderMenuComponent
  ],
  entryComponents: [ConfirmationDialogComponent],
  providers: [{provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}}]
})
export class SharedModule {}
