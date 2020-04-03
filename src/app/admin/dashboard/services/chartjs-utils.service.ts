import {Injectable, EventEmitter} from '@angular/core';
import * as Chart from 'chart.js';
import {DecimalPipe} from '@angular/common';

@Injectable()
export class ChartjsUtilsService {
  loaded: EventEmitter<any>;

  constructor() {
    this.loaded = new EventEmitter();
  }

  applyNumberSeparatorsToTooltips(tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData, decimalPipe: DecimalPipe) {
    let label = data.datasets[tooltipItem.datasetIndex].label || '';

    if (label) {
      label += ': ';
    }

    label += decimalPipe.transform(tooltipItem.value);

    return label;
  }

  applyNumberSeparatorsToTooltipsForDonut(tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData, decimalPipe: DecimalPipe) {
    let label = data.labels[tooltipItem.index] + ': ';

    label += decimalPipe.transform(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]);

    return label;
  }
}
