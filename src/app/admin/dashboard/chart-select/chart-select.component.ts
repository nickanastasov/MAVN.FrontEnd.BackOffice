import {Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-chart-select',
  templateUrl: './chart-select.component.html',
  styleUrls: ['./chart-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartSelectComponent implements OnInit {
  @Input()
  dropdownData: any[] = [];
  selectedChartType: any;
  @Output() chartSelectType = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {
    if (this.dropdownData.length > 0) {
      this.selectedChartType = this.dropdownData[0].value;
    }
  }

  showValueChanged(event: any) {
    this.chartSelectType.emit(event);
  }
}
