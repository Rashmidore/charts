import { Component, Input, OnInit, ElementRef, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart4',
  templateUrl: './chart4.component.html',
  styleUrls: ['./chart4.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Chart4Component implements OnInit, OnChanges {

  // main elements
  host: any;
  svg: any;

  // containers
  dataContainer: any;
  xAxisContainer: any;
  yAxisContainer: any;

  // labels
  xLabel: any;
  yLabel: any;

  @Input() data;

  // user options
  xValue: string;
  yValue: string;

  // dimensions
  dimensions: DOMRect;
  innerWidth: number;
  innerHeight: number;

  margins = {
    left: 40,
    top: 10,
    right: 20,
    bottom: 40
  };

  // scales
  x: any;
  y: any;
  colors: any;

  // axis
  xAxis: any;
  yAxis: any;

  get scatterData() {
    if (!this.xValue || !this.yValue) { return []; }

    return this.data.map((elem) => {
      return {
        x: +elem[this.xValue],
        y: +elem[this.yValue],
        species: elem.Species
      };
    });
  }

  constructor(element: ElementRef) {
    this.host = d3.select(element.nativeElement);
  }

  ngOnInit(): void {
    this.svg = this.host.select('svg');

    this.setDimensions();
    this.setElements();
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.svg) { return; }
    this.updateChart();
  }

  setOption(option: string, event) {
    const value = event && event.target && event.target.value;

    switch(option) {
      case 'x':
        this.xValue = value;
        break;
      case 'y':
        this.yValue = value;
        break;
    }

    this.updateChart();
  }

  updateChart() {
    this.setParams();
    this.setLabels();
    this.setAxis();
    this.draw();
  }

  setDimensions() {
    this.dimensions = this.svg.node().getBoundingClientRect();

    this.innerWidth = this.dimensions.width - this.margins.left - this.margins.right;
    this.innerHeight = this.dimensions.height - this.margins.top - this.margins.bottom;

    this.svg.attr('viewBox', [0, 0, this.dimensions.width, this.dimensions.height]);
  }

  setElements() {

    this.xAxisContainer = this.svg
      .append('g')
      .attr('class', 'xAxisContainer')
      .attr('transform', `translate(${this.margins.left}, ${this.margins.top + this.innerHeight})`);

    this.yAxisContainer = this.svg
      .append('g')
      .attr('class', 'yAxisContainer')
      .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`);

    this.xLabel = this.svg
      .append('g')
      .attr('class', 'xLabelContainer')
      .attr('transform', `translate(${this.margins.left + 0.5 * this.innerWidth}, ${this.dimensions.height - 5})`)
      .append('text')
      .attr('class', 'label')
      .style('text-anchor', 'middle');

    this.yLabel = this.svg
    .append('g')
    .attr('class', 'yLabelContainer')
    .attr('transform', `translate(15, ${this.margins.top + 0.5 * this.innerHeight})`)
    .append('text')
    .attr('class', 'label')
    .attr('transform', 'rotate(-90)')
    .style('text-anchor', 'middle');

    this.dataContainer = this.svg
      .append('g')
      .attr('class', 'dataContainer')
      .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`);
  }

  setParams() {
    const maxXValue = this.xValue ? d3.max(this.data, (d) => +d[this.xValue]) : 1;
    const maxYValue = this.yValue ? d3.max(this.data, (d) => +d[this.yValue]) : 1;
    const uniqueSpecies = new Set((this.data || []).map((d) => d.Species));

    this.x = d3.scaleLinear()
      .domain([0, maxXValue])
      .range([0, this.innerWidth]);

    this.y = d3.scaleLinear()
      .domain([0, maxYValue])
      .range([this.innerHeight, 0]);

    this.colors = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(uniqueSpecies);
  }

  setLabels() {
    this.xLabel.text(this.xValue);
    this.yLabel.text(this.yValue);
  }

  setAxis() {
    this.xAxis = d3.axisBottom(this.x)
      .tickSizeOuter(0);

    this.xAxisContainer
      .transition()
      .duration(500)
      .call(this.xAxis);

    this.yAxis = d3.axisLeft(this.y)
      .ticks(5)
      .tickSizeOuter(0)
      .tickSizeInner(-this.innerWidth);

    this.yAxisContainer
      .transition()
      .duration(500)
      .call(this.yAxis);

    this.yAxisContainer.selectAll('.tick:not(:nth-child(2)) line')
      .style('stroke', '#ddd')
      .style('stroke-dasharray', '2 2');
  }

  draw() {

    // bind the data
    const scatter = this.dataContainer
      .selectAll('circle.data')
      .data(this.scatterData);

    //enter and merge
    scatter.enter()
      .append('circle')
      .attr('class', 'data')
      .attr('r', 4)
      .style('fill', (d) => this.colors(d.species))
      .style('opacity', 0.4)
      .merge(scatter)
      .attr('cx', (d) => this.x(d.x))
      .attr('cy', (d) => this.y(d.y));

    // exit
    scatter.exit().remove();
  }

}
