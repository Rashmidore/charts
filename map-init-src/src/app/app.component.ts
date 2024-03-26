import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { IPieConfig, IPieData, IGroupStackData, IGroupStackDataElem, IGroupStackConfig } from './interfaces/chart.interfaces';
import { PieHelper } from './helpers/pie.helper';

import * as d3 from 'd3';
import { StackHelper } from './helpers/stack.helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'DashboardOne';

  data1 = [125, 100, 50, 75, 200, 300, 100];
  data2$: Observable<any[]>;

  iris$: Observable<any>;

  covidData$: Observable<any>;

  browser$: Observable<any>;
  browser: any;

  pieData: IPieData = {
    title: '',
    data: []
  };

  pieConfig = {};

  pieConfig2 = {
    innerRadiusCoef: 0,
    arcs: {
      radius: 0,
    },
  };

  population$: Observable<any>;

  population;

  stackedData: IGroupStackData;

  stackOptions = [
    {
      label: 'Year (grouped)',
      value: 'year/gender/age_group/'
    }, {
      label: 'Year (no group - stacked)',
      value: 'year//age_group/'
    }, {
      label: 'Year (grouped - no stack)',
      value: 'year/age_group//'
    }, {
      label: 'Year (no group - no stack)',
      value: 'year///'
    }, {
      label: 'Countries 2012',
      value: 'country/gender/age_group/2012'
    }, {
      label: 'Country 2006',
      value: 'country/gender/age_group/2006'
    }, {
      label: 'Country (no group - stacked)',
      value: 'country//age_group/2012'
    }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.data2$ = this.api.getEmployees();
    this.iris$ = this.api.getIris();

    this.covidData$ = this.api.getCovidData();

    this.browser$ = this.api.getBrowsersData();

    this.browser$.subscribe((data) => {
      this.browser = data;
      this.setPieData('now');
    });

    this.population$ = this.api.getParsedData('assets/population.csv');

    this.population$.subscribe(data => {
      this.population = data;
      this.setStackedData('year/gender/age_group/');
    });

    setTimeout(
      () => {
        console.log();

        this.data1 = [...this.data1, 600]; }
      , 5000
    )
  }

  /*   convertBrowserToPieData(valueAttr: string) {
    const data = this.browser.map((elem) => ({
      id: elem.name,
      label: elem.name,
      value: elem[valueAttr]
    }));

    return {
      title: "Browser market share",
      data
    }
  } */

  setPieData(event) {
    const valueAttr = typeof event === 'string' ? event : event.target.value;
    this.pieData = PieHelper.convert(this.browser, "Browser market share", valueAttr, 'name', 'name');
  }

  setStackedData(event) {
    const valueAttr = typeof event === 'string' ? event : event.target.value;

    const [domain, group, stack, year] = valueAttr.split('/');

    const population = year == '' ? this.population : this.population.filter((d) => d.year === year);

    const data = StackHelper.SetStacks(population, domain, group, stack, 'value', (val) => val/1e6);

      this.stackedData = {
        title: ' Population by year, gender and age group (in millions)',
        yLabel: 'Population (millions)',
        unit: 'million',
        data,
        stackOrder: ['<3', '4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '>=40']
      };

  }

}
