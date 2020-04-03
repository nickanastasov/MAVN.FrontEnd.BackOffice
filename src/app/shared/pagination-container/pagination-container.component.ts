import {Component, ViewChild, OnInit, Output, EventEmitter, OnDestroy, Input} from '@angular/core';
import {PaginationRequestFromEvent} from 'src/app/shared/pagination-container/models/pageRequestModel.interface';
import {PageEvent} from '@angular/material';
import {Subscription} from 'rxjs';
import {BeautifiedPaginatorComponent} from '../beautified-paginator/beautified-paginator.component';

@Component({
  selector: 'app-pagination-container',
  templateUrl: './pagination-container.component.html',
  styleUrls: ['./pagination-container.component.scss']
})
export class PaginationContainerComponent implements OnInit, OnDestroy {
  @Input()
  totalCount: number;

  @Input()
  showLength = true;

  @Input()
  showPages = true;

  @Input()
  showFirstLastButtons = true;

  @Input()
  currentPage: number;

  @Input()
  pageSize: number = 10;

  @Output()
  paginationEvent = new EventEmitter<PaginationRequestFromEvent>();

  @ViewChild(BeautifiedPaginatorComponent)
  paginator: BeautifiedPaginatorComponent;

  // current component properties
  pageSizeOptions = [10, 25, 50, 100, 200];
  paginationEventSubscription: Subscription;

  constructor() {
    this.totalCount = 0;
  }

  ngOnInit() {
    this.paginationEventSubscription = this.paginator.page.subscribe((pageEvent: PageEvent) => {
      this.paginationEvent.emit(new PaginationRequestFromEvent(pageEvent));
    });

    const paginationOptions = new PaginationRequestFromEvent({
      pageSize: this.pageSize ? this.pageSize : this.pageSizeOptions[0],
      pageIndex: this.currentPage ? this.currentPage : 0,
      length: 0 // needed just to following the paginator PageEvent
    });

    this.paginationEvent.emit(paginationOptions);
  }

  ngOnDestroy() {
    if (this.paginationEventSubscription) {
      this.paginationEventSubscription.unsubscribe();
    }
  }
}
