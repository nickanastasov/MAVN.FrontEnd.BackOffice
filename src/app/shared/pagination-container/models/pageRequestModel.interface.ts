import {PageEvent} from '@angular/material';

export interface PageRequestModel {
  PageSize: number;
  CurrentPage: number;
}

export class PaginationRequestFromEvent implements PageRequestModel {
  PageSize: number;
  CurrentPage: number;
  constructor(pageEvent: PageEvent) {
    this.PageSize = pageEvent.pageSize;
    this.CurrentPage = pageEvent.pageIndex;
  }
}
