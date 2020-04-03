import {ChartType, ChartOptions, ChartData, ChartConfiguration} from 'chart.js';

export class ChartjsLineChartConfiguration implements ChartConfiguration {
  type: ChartType = 'line';
  data: ChartData;
  options: ChartOptions = {
    maintainAspectRatio: true,
    responsive: true
  };
}
