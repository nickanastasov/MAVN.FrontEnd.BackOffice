import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';

import {ChartjsLineChartConfiguration} from '../models/chartjs/chartjs-line-chart-configuration.class';
import {SmallGraphicItem} from './small-graphic-item.interface';
import {ChartjsUtilsService} from '../services/chartjs-utils.service';
import {ChartData} from 'chart.js';
import {DecimalPipe} from '@angular/common';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-small-graphic-boxes',
  templateUrl: './small-graphic-boxes.component.html',
  styleUrls: ['./small-graphic-boxes.component.scss']
})
export class SmallGraphicBoxesComponent implements OnInit, OnChanges {
  @Input()
  newCustomersTooltip: string = '';
  @Input()
  activeCustomersTooltip: string = '';
  @Input()
  nonActiveCustomersTooltip: string = '';
  @Input()
  smallGraphicItems: SmallGraphicItem[] = [];
  @Input()
  showPercentage: boolean = true;

  private defaultLineChartConfiguration: ChartjsLineChartConfiguration;
  private lineCharts: Chart[] = [];

  constructor(private decimalPipe: DecimalPipe, private chartjsUtilsService: ChartjsUtilsService) {}

  ngOnInit() {
    this.defaultLineChartConfiguration = Object.assign(new ChartjsLineChartConfiguration(), {
      options: {
        title: {
          display: false
        },
        legend: {
          display: false,
          labels: {
            usePointStyle: false
          }
        },
        maintainAspectRatio: false,
        tooltips: {
          displayColors: false,
          intersect: false,
          mode: 'index',
          callbacks: {
            label: (tooltipItem: Chart.ChartTooltipItem, data: ChartData) => {
              return this.chartjsUtilsService.applyNumberSeparatorsToTooltips(tooltipItem, data, this.decimalPipe);
            }
          }
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
                drawBorder: false
              },
              ticks: {
                display: false
              }
            }
          ],
          yAxes: [
            {
              gridLines: {
                display: false,
                drawBorder: false
              },
              ticks: {
                display: false,
                callback: (value: any) => {
                  return this.decimalPipe.transform(value);
                },
                padding: 5
              }
            }
          ]
        },
        elements: {
          point: {
            radius: 0,
            borderWidth: 0,
            hoverRadius: 0,
            hoverBorderWidth: 0
          }
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.smallGraphicItems.currentValue.length > 0) {
      setTimeout(() => {
        this.prepareLineCharts();
      }, 1);
    }
  }

  private prepareLineCharts() {
    const lineChartIndexes: any[] = [];
    const lineChartConfigurations: ChartjsLineChartConfiguration[] = [];

    this.smallGraphicItems.forEach((item, itemIndex) => {
      if (this.shouldShowChart(item)) {
        const currentChartData = item.data;

        currentChartData.datasets[0].backgroundColor = 'transparent';
        currentChartData.datasets[0].borderColor = '#4e3a96';
        currentChartData.datasets[0].borderWidth = 3;

        lineChartIndexes.push({itemIndex, data: currentChartData});
      }
    });

    if (lineChartIndexes.length > 0) {
      lineChartIndexes.forEach((lineChartInformation: any) => {
        const currentLineChartConfiguration = Object.assign({}, this.defaultLineChartConfiguration, {data: lineChartInformation.data});

        lineChartConfigurations.push(currentLineChartConfiguration);
      });

      this.drawLineChart(lineChartIndexes, lineChartConfigurations);
    }
  }

  shouldShowChart(item: SmallGraphicItem) {
    return !item.percentage && item.percentage !== 0 && !!item.data;
  }

  private drawLineChart(lineChartIndexes: any[], lineChartConfigurations: ChartjsLineChartConfiguration[]) {
    if (lineChartConfigurations.length > 0) {
      lineChartConfigurations.forEach((chartConfiguration: any, configurationIndex: any) => {
        const smallLineChartIndex = lineChartIndexes[configurationIndex].itemIndex;

        this.lineCharts.push(new Chart('small-line-chart-' + smallLineChartIndex, chartConfiguration));
      });
    }
  }
}
