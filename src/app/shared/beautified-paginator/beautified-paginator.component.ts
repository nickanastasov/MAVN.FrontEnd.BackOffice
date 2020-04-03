import {coerceNumberProperty, coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {
  HasInitialized,
  HasInitializedCtor,
  mixinInitialized,
  ThemePalette,
  mixinDisabled,
  CanDisableCtor,
  CanDisable
} from '@angular/material/core';
import {PageEvent} from '@angular/material';

/** The default page size if there is no page size and there are no provided page size options. */
const DEFAULT_PAGE_SIZE = 10;

// Boilerplate for applying mixins to MatPaginator.
/** @docs-private */
class MatPaginatorBase {}
const _MatPaginatorBase: CanDisableCtor & HasInitializedCtor & typeof MatPaginatorBase = mixinDisabled(mixinInitialized(MatPaginatorBase));

/**
 * Component to provide navigation between paged information. Displays the size of the current
 * page, user-selectable options to change that size, what items are being shown, and
 * navigational button to go to the previous or next page.
 */
@Component({
  selector: 'app-beautified-paginator',
  templateUrl: './beautified-paginator.component.html',
  styleUrls: ['./beautified-paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class BeautifiedPaginatorComponent extends _MatPaginatorBase implements OnInit, OnDestroy, CanDisable, HasInitialized {
  private _initialized: boolean;

  /** Theme color to be used for the underlying form controls. */
  @Input() color: ThemePalette;

  /** The zero-based page index of the displayed list of items. Defaulted to 0. */
  @Input()
  get pageIndex(): number {
    return this._pageIndex;
  }
  set pageIndex(value: number) {
    value = Math.max(coerceNumberProperty(value), 0);

    if (this._pageIndex === value) {
      return;
    }

    this._pageIndex = value;
    this.updatePages();
    this._changeDetectorRef.markForCheck();
  }
  private _pageIndex = 0;

  /** The length of the total number of items that are being paginated. Defaulted to 0. */
  @Input()
  get length(): number {
    return this._length;
  }
  set length(value: number) {
    this._length = coerceNumberProperty(value);
    this.updatePages();
    this._changeDetectorRef.markForCheck();
  }
  private _length = 0;

  /** Number of items to display on a page. By default set to 10. */
  @Input()
  get pageSize(): number {
    return this._pageSize;
  }
  set pageSize(value: number) {
    value = Math.max(coerceNumberProperty(value), 0);

    if (this._pageSize === value) {
      return;
    }

    this._pageSize = value;

    this.updatePages();
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSize: number;

  /** The set of provided page size options to display to the user. */
  @Input()
  get pageSizeOptions(): number[] {
    return this._pageSizeOptions;
  }
  set pageSizeOptions(value: number[]) {
    this._pageSizeOptions = (value || []).map(p => coerceNumberProperty(p));
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSizeOptions: number[] = [];

  /** Whether to hide the page size selection UI from the user. */
  @Input()
  get hidePageSize(): boolean {
    return this._hidePageSize;
  }
  set hidePageSize(value: boolean) {
    this._hidePageSize = coerceBooleanProperty(value);
  }
  private _hidePageSize = false;

  /** Whether to show the first/last buttons UI to the user. */
  @Input()
  get showFirstLastButtons(): boolean {
    return this._showFirstLastButtons;
  }
  set showFirstLastButtons(value: boolean) {
    this._showFirstLastButtons = coerceBooleanProperty(value);
  }
  private _showFirstLastButtons = false;

  /** Whether to show the total item UI to the user. */
  @Input()
  get showLength(): boolean {
    return this._showLength;
  }
  set showLength(value: boolean) {
    this._showLength = coerceBooleanProperty(value);
  }
  private _showLength = true;

  /** Whether to show the pages numbers UI to the user. */
  @Input()
  get showPages(): boolean {
    return this._showPages;
  }
  set showPages(value: boolean) {
    this._showPages = coerceBooleanProperty(value);
  }
  private _showPages = true;

  pagesNumber = 5;
  pages: number[] = [];

  /** Event emitted when the paginator changes the page size or page index. */
  @Output() readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  /** Displayed set of page size options. Will be sorted and include current page size. */
  _displayedPageSizeOptions: number[];

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this._initialized = true;
    this._updateDisplayedPageSizeOptions();
    this._markInitialized();
  }

  ngOnDestroy() {}

  /** Advances to the next page if it exists. */
  nextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }

    const previousPageIndex = this.pageIndex;
    this.pageIndex++;
    this._emitPageEvent(previousPageIndex);
  }

  /** Move back to the previous page if it exists. */
  previousPage(): void {
    if (!this.hasPreviousPage()) {
      return;
    }

    const previousPageIndex = this.pageIndex;
    this.pageIndex--;
    this._emitPageEvent(previousPageIndex);
  }

  /** Move to the first page if not already there. */
  firstPage(): void {
    // hasPreviousPage being false implies at the start
    if (!this.hasPreviousPage()) {
      return;
    }

    const previousPageIndex = this.pageIndex;
    this.pageIndex = 0;
    this._emitPageEvent(previousPageIndex);
  }

  /** Move to the last page if not already there. */
  lastPage(): void {
    // hasNextPage being false implies at the end
    if (!this.hasNextPage()) {
      return;
    }

    const previousPageIndex = this.pageIndex;
    this.pageIndex = this.getNumberOfPages() - 1;
    this._emitPageEvent(previousPageIndex);
  }

  /** Whether there is a previous page. */
  hasPreviousPage(): boolean {
    return this.pageIndex >= 1 && this.pageSize !== 0;
  }

  /** Whether there is a next page. */
  hasNextPage(): boolean {
    const maxPageIndex = this.getNumberOfPages() - 1;
    return (this.pageIndex < maxPageIndex && this.pageSize !== 0) || this.length === Infinity;
  }

  /** Calculate the number of pages */
  getNumberOfPages(): number {
    if (!this.pageSize) {
      return 0;
    }

    return Math.ceil(this.length / this.pageSize);
  }

  updatePages(): void {
    if (this.getNumberOfPages() === 0) {
      // hide page buttons when there are no items
      this.pages = [];
      return;
    }

    let end = Math.ceil((this.pageIndex + 1) / this.pagesNumber) * this.pagesNumber;

    if (end > this.getNumberOfPages()) {
      end = this.getNumberOfPages();
    }

    const start = Math.max(end - this.pagesNumber, 0);

    const pages = [];

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    this.pages = pages;
  }

  goToPage(page: number): void {
    const previousPageIndex = this.pageIndex;
    this.pageIndex = page;
    this._emitPageEvent(previousPageIndex);
  }

  /** A label for the range of items within the current page and the length of the whole list. */
  getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0`;
    }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    let endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

    // only for infinite pagination
    if (!this.showLength) {
      endIndex = endIndex < length ? endIndex : length + startIndex;
    }

    return `${startIndex + 1} - ${endIndex}`;
  };

  /**
   * Changes the page size so that the first item displayed on the page will still be
   * displayed using the new page size.
   *
   * For example, if the page size is 10 and on the second page (items indexed 10-19) then
   * switching so that the page size is 5 will set the third page as the current page so
   * that the 10th item will still be displayed.
   */
  _changePageSize(pageSize: number) {
    // Current page needs to be updated to reflect the new page size. Navigate to the page
    // containing the previous page's first item.
    const startIndex = this.pageIndex * this.pageSize;
    const previousPageIndex = this.pageIndex;

    this.pageIndex = Math.floor(startIndex / pageSize) || 0;
    this.pageSize = pageSize;
    this._emitPageEvent(previousPageIndex);
  }

  /** Checks whether the buttons for going forwards should be disabled. */
  _nextButtonsDisabled() {
    return this.disabled || !this.hasNextPage();
  }

  /** Checks whether the buttons for going backwards should be disabled. */
  _previousButtonsDisabled() {
    return this.disabled || !this.hasPreviousPage();
  }

  /**
   * Updates the list of page size options to display to the user. Includes making sure that
   * the page size is an option and that the list is sorted.
   */
  private _updateDisplayedPageSizeOptions() {
    if (!this._initialized) {
      return;
    }

    // If no page size is provided, use the first page size option or the default page size.
    if (!this.pageSize) {
      this._pageSize = this.pageSizeOptions.length !== 0 ? this.pageSizeOptions[0] : DEFAULT_PAGE_SIZE;
    }

    this._displayedPageSizeOptions = this.pageSizeOptions.slice();

    if (this._displayedPageSizeOptions.indexOf(this.pageSize) === -1) {
      this._displayedPageSizeOptions.push(this.pageSize);
    }

    // Sort the numbers using a number-specific sort function.
    this._displayedPageSizeOptions.sort((a, b) => a - b);
    this._changeDetectorRef.markForCheck();
  }

  /** Emits an event notifying that a change of the paginator's properties has been triggered. */
  private _emitPageEvent(previousPageIndex: number) {
    this.page.emit({
      previousPageIndex,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.length
    });
  }
}
