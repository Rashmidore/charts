import { Component, Input, OnInit, ElementRef, ViewEncapsulation, SimpleChanges, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { merge } from 'rxjs';

@Component({
  selector: 'app-chart5',
  templateUrl: './chart5.component.html',
  styleUrls: ['./chart5.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Chart5Component implements OnInit, OnChanges {

  @Input() data;

  // main elements
  host: any;
  svg: any;

  // dimensions
  dimensions: DOMRect;

  innerWidth: number;
  innerHeight: number;

  margins = {
    left: 50,
    top: 40,
    right: 20,
    bottom: 80
  };

  // containers
  dataContainer: any;
  xAxisContainer: any;
  yAxisContainer: any;
  legendContainer: any;

  // label
  title: any;

  // time formatters
  timeParse = d3.timeParse('%Y%m%d');
  niceData = d3.timeFormat('%Y-%B'); // 2021-March

  // scales
  x: any;
  y: any;
  colors: any;

  // selected data
  selected = ['hospitalized', 'death', 'hospitalizedCurrently'];
  active = [true, true, true];

  // axis
  xAxis: any;
  yAxis: any;

  // line generator
  line: any;

  // getters

  get lineData() {
/*     return !this.data ? [] : this.data.map((d) => {
      return {
        x: this.timeParse(d.date),
        y: d.hospitalized
      };
    }); */
    if (!this.data) { return []; }

    return this.selected
      .filter((d, i) => this.active[i])
      .map((item) => {
        return {
          name: item,
          data: this.data.map((d) => ({
            x: this.timeParse(d.date),
            y: d[item]
          }))
          .filter((d) => d.y != null)
          .sort((a, b) => a.x < b.x ? -1 : 1)
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
    if (!this.svg) { return ; }
    this.updateChart();
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

    this.title = this.svg
      .append('g')
      .attr('class', 'titleContainer')
      .attr('transform', `translate(${this.margins.left + 0.5 * this.innerWidth}, ${0.5 * this.margins.top})`)
      .append('text')
      .attr('class', 'title')
      .style('text-anchor', 'middle');

    this.dataContainer = this.svg
      .append('g')
      .attr('class', 'dataContainer')
      .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`);

      this.legendContainer = this.svg
      .append('g')
      .attr('class', 'legendContainer')
      .attr('transform', `translate(${this.margins.left}, ${this.dimensions.height - 0.5 * this.margins.bottom + 10})`);
  }

  setParams() {

    const data = this.lineData;

    // temporary solution
    const parsedDates = !this.data ? [] : this.data.map((d) => this.timeParse(d.date));


    // domains
    const xDomain = !!parsedDates ? d3.extent(parsedDates) : [0, Date.now()];

    const maxValues = data.map((series) => d3.max(series.data, (d) => d.y));

    const yDomain = !this.data ? [0, 100] : [0, d3.max(maxValues)];

    const colorDomain = this.selected;

    // ranges
    const xRange = [0, this.innerWidth];
    const yRange = [this.innerHeight, 0];
    const colorRange = d3.schemeCategory10;

    // set scales
    this.x = d3.scaleTime()
      .domain(xDomain)
      .range(xRange);

    this.y = d3.scaleLinear()
      .domain(yDomain)
      .range(yRange);

    this.colors = d3.scaleOrdinal()
      .domain(colorDomain)
      .range(colorRange);

    // line
    this.line = d3.line()
    .x((d) => this.x(d.x))
    .y((d) => this.y(d.y));

  }

  setLabels() {
    this.title.text('Covid 10 evolution in US');
  }

  setAxis() {
    this.xAxis = d3.axisBottom(this.x)
      .ticks(d3.timeMonth.every(2))
      .tickSizeOuter(0);

    this.xAxisContainer
      .transition()
      .duration(500)
      .call(this.xAxis);

    this.yAxis = d3.axisLeft(this.y)
      .ticks(8)
      .tickSizeOuter(0)
      .tickFormat(d3.format('~s'))
      .tickSizeInner(-this.innerWidth);

    this.yAxisContainer
      .transition()
      .duration(500)
      .call(this.yAxis);

    this.yAxisContainer.selectAll('.tick:not(:nth-child(2)) line')
      .style('stroke', '#ddd')
      .style('stroke-dasharray', '2 2');
  }

  setLegend() {

    // specific methods
    const generateLegendItems = (selection: any) => {
      selection.append('circle')
        .attr('class', 'legend-icon')
        .attr('cx', 3)
        .attr('cy', -4)
        .attr('r', 3);

      selection.append('text')
        .attr('class', 'legend-label')
        .attr('x', 9)
        .style('font-size', '0.8rem');
    }

    const updateLegendItems = (selection) => {
      selection
        .selectAll('circle.legend-icon')
        .style('fill', (d) => this.colors(d));

      selection
        .selectAll('text.legend-label')
        .text((d) => d);
    }

    // 1. select item containers and bind data
    const itemContainers = this.legendContainer.selectAll('g.legend-item')
      .data(this.selected);

    itemContainers.enter()
      .append('g')
        .attr('class', 'legend-item')
        .call(generateLegendItems)
      .merge(itemContainers)
        .call(updateLegendItems)
        .on('mouseover', (event, name) => this.hoverLine(name))
        .on('mouseleave', () => this.hoverLine())
        .on('click', (event, name) => {
          this.toggleActive(name);
          this.updateChart();
        })
        .transition()
        .duration(500)
        .style('opacity', (d, i) => this.active[i] ? 1 : 0.3);

    //   b. bind events (click + hover)

    // 4. update state
    //   a. transition
    //   b. set opacity (if active => 1 else 0.3)

    // 5. remove groups not needed
      itemContainers.exit().remove();


    // 6. repositioning items

      let totalPadding = 0;

      this.legendContainer.selectAll('g.legend-item')
      .each(function() {
        const g = d3.select(this);
        g.attr('transform', `translate(${totalPadding}, 0)`);
        totalPadding += g.node().getBBox().width + 10;
      });

    // 7. repositioning legend
      const legendWidth = this.legendContainer.node().getBBox().width;

      this.legendContainer
        .attr('transform', `translate(${this.margins.left + 0.5 * (this.innerWidth - legendWidth)}, ${this.dimensions.height - 0.5 * this.margins.bottom + 10})`);


  }

  draw() {
    // binding data
    const lines = this.dataContainer.selectAll('path.data')
      .data(this.lineData, (d) => d.name);

    // enter and merge
    lines.enter().append('path')
      .attr('class', 'data')
      .style('fill', 'none')
      .style('stroke-width', '2px')
      .merge(lines)
      .transition()
      .duration(500)
      .attr('d', (d) => this.line(d.data))
      .style('stroke', (d) => this.colors(d.name));

    // exit
    lines.exit().remove();
  }

  updateChart() {
    this.setParams();
    this.setLabels();
    this.setAxis();
    this.setLegend();
    this.draw();
  }

  toggleActive(selected: string) {
    const index = this.selected.indexOf(selected);
    this.active[index] = !this.active[index];
  }

  hoverLine(selected?: string) {
    const index = this.selected.indexOf(selected);

    if (selected && this.active[index]) {
      this.dataContainer.selectAll('path.data')
      .attr('opacity', (d) => d.name === selected ? 1 : 0.3)
      .style('stroke-width', (d) => d.name === selected ? '3px' : '2px');
    } else {
      this.dataContainer.selectAll('path.data')
      .style('stroke-width', '2px')
      .attr('opacity', null);
    }

  }

}
