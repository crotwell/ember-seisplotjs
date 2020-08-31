import Component from '@glimmer/component';
import { A, isArray } from '@ember/array';
import EmberObject from '@ember/object';
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { sort } from '@ember/object/computed';
import {d3, seismogram, seismographconfig, seismograph} from 'seisplotjs';

class SortFieldType {
  name = "name";
  field = "field";
  constructor(obj) {
    this.name = obj.name;
    this.field = obj.field;
  }
}

export default class SeismogramDisplayListComponent extends Component {

  sortTypes = A([
    new SortFieldType({name: 'km', field: 'distaz.distanceKm'}),
    new SortFieldType({ name: 'deg', field: 'distaz.distanceDeg'}),
    //new SortFieldType({ name: 'alpha', field: 'codes'}),
    new SortFieldType({ name: 'az', field: 'distaz.azimuth'}),
    new SortFieldType({ name: 'baz', field: 'distaz.backazimuth'}) ]);


  @tracked sortDefinition = A([ `${this.sortTypes[0].field}:asc` ]);
  @tracked seismographConfig;

  get sortDirection() {
    return this.sortDefinition.get(1).split(':')[1];
  }

  get sortField() {
    return this.sortDefinition.get(0).split(':')[0];
  }

  get sortFieldName() {
    const sf = this.sortDefinition.get(0).split(':')[0];

    return this.calcSortFieldName(sf);
  }

  calcSortFieldName(sf) {
    for(let i=0; i<this.sortTypes.length; i++) {
      if (this.sortTypes[i].field === sf) {
        return this.sortTypes[i].name;
      }
    }
    return sf;
  }

  @sort('args.seisDisplayList', 'sortDefinition') sortedSeisDisplayList;

  constructor() {
    super(...arguments);
    if (this.args.sortDefinition) {
      // maybe check for array?
      if (isArray(this.args.sortDefinition)) {
        this.sortDefinition = this.args.sortDefinition;
      } else {
        this.sortDefinition = A([this.args.sortDefinition]);
      }
    } else {
      this.sortDefinition = A([ `${this.sortTypes[0]}:asc` ]);
    }
    if (this.args.seismographConfig) {
      this.seismographConfig = this.args.seismographConfig;
    } else {
      this.seismographConfig = new seismographconfig.SeismographConfig();
      this.seismographConfig.title = seismographconfig.DEFAULT_TITLE;
      this.seismographConfig.linkedAmpScale = new seismographconfig.LinkedAmpScale();
      this.seismographConfig.linkedTimeScale = new seismographconfig.LinkedTimeScale();
      this.seismographConfig.wheelZoom = false;
      this.seismographConfig.margin.top = 5;
    }
  }

  @action sortBy(key) {
    let direction = "asc";
    if (this.sortDefinition[0].startsWith(key)) {
      if (this.sortDefinition[0].endsWith(":desc")) {
        direction = "asc";
      } else {
        direction = "desc";
      }
    } else {
      direction = "asc";
    }
    this.sortDefinition = [ key+":"+direction ];
  }
}
