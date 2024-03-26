import { Component, OnInit, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-chart1',
  templateUrl: './chart1.component.html',
  styleUrls: ['./chart1.component.scss']
})
export class Chart1Component implements OnInit, OnChanges {

  @Input() data;
  xlabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  rectWidth = 80;
  max = 250;
  dimensions: DOMRect;
  outerPadding = 20;
  padding = 0;
  bandwidth = 0;
  bandwidthCoef = 0.8; // 80% = 0.8;
  left = 10; right = 20; bottom = 16; top = 15;
  innerWidth: number;
  innerHeight: number;
/*   margin = {
    left: 10,
    right: 20,
    bottom:30,
    top: 15
  }; */

  // width = width svg / number of rectangles
  // width = svg.width / data.length

  constructor(private element: ElementRef) {
   }

  ngOnInit() {
    const svg = this.element.nativeElement.getElementsByTagName('svg')[0];
    this.dimensions = svg.getBoundingClientRect();
    this.innerWidth = this.dimensions.width - this.left - this.right;
    this.innerHeight = this.dimensions.height - this.top - this.bottom;

    this.setParams();
  }

  ngOnChanges(changes: SimpleChanges) {

    this.setParams();
  }

  setParams() {
    this.rectWidth = (this.innerWidth - 2 * this.outerPadding) / this.data.length;
    this.bandwidth = this.bandwidthCoef * this.rectWidth;
    this.padding = (1 - this.bandwidthCoef) * this.rectWidth;

    this.max = 1.3 * Math.max(...this.data); // 1.3 = 130%
  }

}
