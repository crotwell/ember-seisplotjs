import Component from '@glimmer/component';
import { A, isArray } from '@ember/array';
import EmberObject from '@ember/object';
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { sort } from '@ember/object/computed';
import {
  d3,
  seismogram,
  seismographconfig,
  seismograph,
  displayorganize
} from 'seisplotjs';

class SortFieldType {
  name = "name";
  field = "field";
  constructor(obj) {
    this.name = obj.name;
    this.field = obj.field;
  }
}

class OrganizeType {
  name = "name";
  orgFunction = (sddList => sddList);
  constructor(obj) {
    this.name = obj.name;
    this.orgFunction = obj.orgFunction;
  }
}

class OrientType {
  code = "name";
  @tracked isSelected = false;
  constructor(obj) {
    this.code = obj.code;
    this.isSelected = obj.isSelected;
  }
}

export default class SeismogramDisplayListComponent extends Component {

  organizeTypes = A([
    new OrganizeType({name: 'individual', orgFunction: displayorganize.individualDisplay}),
    new OrganizeType({name: 'component', orgFunction: displayorganize.overlayByComponent}),
    new OrganizeType({name: 'station', orgFunction: displayorganize.overlayByStation}),
    new OrganizeType({name: 'all', orgFunction: displayorganize.overlayAll}),
  ]);

  sortTypes = A([
    new SortFieldType({name: 'km', field: 'distaz.distanceKm'}),
    new SortFieldType({ name: 'deg', field: 'distaz.distanceDeg'}),
    //new SortFieldType({ name: 'alpha', field: 'codes'}),
    new SortFieldType({ name: 'az', field: 'distaz.azimuth'}),
    new SortFieldType({ name: 'baz', field: 'distaz.backazimuth'})
  ]);

  @tracked sortDefinition = A([ `${this.sortTypes[0].field}:asc` ]);
  @tracked seismographConfig;
  @tracked organizeDefinition = this.organizeTypes[0].name;

  @tracked selectedBands = A([]);
  @tracked selectedInstruments = A([]);
  @tracked selectedOrientations = A([]);
  @tracked selectedStations = A([]);

  @action handleStationSelected(sel) {
    console.log(`handleStationSelected ${sel.join(',')}`);
    this.selectedStations = sel;
  }
    @action handleBandSelected(sel) {
      console.log(`handleBandSelected ${sel.join(',')}`);
      this.selectedBands = sel;
    }
  @action handleInstrumentSelected(sel) {
    console.log(`handleInstrumentSelected ${sel.join(',')}`);
    this.selectedInstruments = sel;
  }
  @action handleOrientationSelected(sel) {
    console.log(`handleOrientSelected ${sel.join(',')}`);
    this.selectedOrientations = sel;
  }

  get bands() {
    let theSet = new Set();
    this.args.seisDisplayList.forEach(sdd => theSet.add(sdd.channelCode.charAt(0)));
    return A(Array.from(theSet.values()));
  }

  get instruments() {
    let theSet = new Set();
    this.args.seisDisplayList.forEach(sdd => theSet.add(sdd.channelCode.charAt(1)));
    return A(Array.from(theSet.values()));
  }

  get orientations() {
    let theSet = new Set();
    this.args.seisDisplayList.forEach(sdd => theSet.add(sdd.channelCode.charAt(2)));
    return A(Array.from(theSet.values()));
  }

  get stations() {
    console.log(`get stations: seismogram-display-list ${this.args.seisDisplayList.length}`)
    let theSet = new Set();
    this.args.seisDisplayList.forEach(sdd => theSet.add(sdd.stationCode));
    let stationCodes = A(Array.from(theSet.values()));
    console.log(`get stations: stations ${stationCodes.length}`)
    return stationCodes;
  }
  
  isBand(code) {
    return this.selectedBands.includes( code );
  }

  isInstrument(code) {
    return this.selectedInstruments.includes( code );
  }

  isOrient(code) {
    return this.selectedOrientations.includes( code );
  }

  isStation(code) {
    return this.selectedStations.includes( code );
  }

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

  get organizedDisplayList() {
    let orgType = null;
    orgType = this.organizeTypes.find(ot => ot.name === this.organizeDefinition);
    const sddList = this.sortedSeisDisplayList;
    console.log(`organizedDisplayList  sddList: ${sddList.length}`)
    let orgList;
    if (orgType) {
      let toDisplayList = sddList.filter(sdd => this.isOrient(sdd.channelCode.charAt(2)))
        .filter(sdd => this.isInstrument(sdd.channelCode.charAt(1)))
        .filter(sdd => this.isBand(sdd.channelCode.charAt(0)))
        .filter(sdd => this.isStation(sdd.stationCode));
      console.log(`filtered toDisplayList: ${toDisplayList.length}`)
      orgList = orgType.orgFunction(toDisplayList);
      orgList.forEach(org => org.seismographConfig = this.seismographConfig);
    } else {
      orgList = displayorganize.individualDisplay(sddList);
    }
    orgList.forEach(org => org.seismographConfig = this.seismographConfig);
    console.log(`get organizedDisplayList  ${orgList.length}`)
    return orgList;
  }

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
    // make sure at least one band is selected, either H or the first code
    let codes = this.bands;
    let defaultCode = codes.find(o => o === 'H');
    if (defaultCode) {
      this.selectedBands.push(defaultCode);
    } else if (codes.length > 0) {
      this.selectedBands.push(codes[0]);
    }
    // make sure at least one instrument is selected, either H or the first code
    codes = this.instruments;
    defaultCode = codes.find(o => o === 'H');
    if (defaultCode) {
      this.selectedInstruments.push(defaultCode);
    } else if (codes.length > 0) {
      this.selectedInstruments.push(codes[0]);
    }
    // make sure at least one band is selected, either H or the first code
    codes = this.orientations;
    defaultCode = codes.find(o => o === 'Z');
    if (defaultCode) {
      this.selectedOrientations.push(defaultCode);
    } else if (codes.length > 0) {
      this.selectedOrientations.push(codes[0]);
    }
    // default select all stations
    this.stations.forEach(s => this.selectedStations.push(s));
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

  @action organizeBy(key) {
    this.organizeDefinition = key;
  }

  @action filterByComponent(oType) {
    console.log(`fileter by ${oType.code}`);
  }

  @action filterByStation(s) {
    console.log(`fileter by station ${s}`);
    if ( this.selectedStations.includes(s)) {
      this.selectedStations.removeObject(s);
    } else {
      this.selectedStations.pushObject(s);
    }
  }
}
