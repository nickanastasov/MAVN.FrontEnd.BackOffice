import {ChartType, ChartOptions, ChartData, ChartConfiguration} from 'chart.js';

export class ChartjsDonutChartConfiguration implements ChartConfiguration {
  type: ChartType = 'doughnut';
  data: ChartData;
  options: ChartOptions = {
    animation: {
      animateScale: true,
      animateRotate: true
    },
    maintainAspectRatio: true,
    responsive: true
  };
}
