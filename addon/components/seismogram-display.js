import Component from '@ember/component';
import { observer } from '@ember/object';
import RSVP from 'rsvp';
import layout from '../templates/components/seismogram-display';
import { inject as service } from '@ember/service';
import { computed } from "@ember/object";
import { getOwner } from "@ember/application";
import seisplotjs from 'ember-seisplotjs';
//import FdsnDataSelect from '../utils/fdsndataselect';
import moment from 'moment';

let miniseed = seisplotjs.miniseed;
let waveformplot = seisplotjs.waveformplot;
let d3 = waveformplot.d3;
//let fdsnDataSelect = new FdsnDataSelect();

//console.log("fdsndataselect from import: "+FdsnDataSelect);


export default Component.extend({
  fdsnDataSelect: service(),
  travelTime: service(),
  seismogramMap: null,
  phases: null,
  isOverlay: false,
  isRotateGCP: false,
  seischartList: [],

  layout,

  didInsertElement() {
    this._super(...arguments);
    this.setupSeisDisplay();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.teardownSeisDisplay();
  },

  setupSeisDisplay() {
    this.updateGraph();
    //Ember.run.scheduleOnce('afterRender', this, 'updateGraph');
  },
  teardownSeisDisplay() {
  },



  updateGraph: function() {
    console.log("updat4Graph: ");
    const that = this;
    this.seischartList = [];
    let elementId = this.get('elementId');
    d3.select('#'+elementId).select("div.seismogramInnerDiv").selectAll("div").remove();
console.log("updat4Graph: "+this.get('channel'));
    if (this.get('seismogramMap')) {
      this.get('seismogramMap').then(seisMap => {
          that.appendWaveformMap(seisMap);
      });
    } else if (this.get('channel')) {
      console.log("got channel for seis display");
      //const ds = fdsnDataSelect;
      const ds = this.get('fdsnDataSelect');
      let seconds = 300;
      let sps = this.get('channel').sampleRate;
      if (sps > 1) {
        seconds = 300;
      } else if (sps <= .1) {
        seconds = 86400;
      } else {
        seconds = 3600;
      }
      return ds.load(this.get('channel'), seconds, moment.utc()).then(seisMap => {
            that.appendWaveformMap(seisMap);
      });
    }
  },
  rotateToGCP(seismogramMap) {
    throw new Error("not yet impl");
  },

  appendWaveformMap: function(seisMap) {
    console.log("appendWaveformMap: "+seisMap.size);
    let that = this;
    let elementId = this.get('elementId');
    let seischartList = that.get('seischartList');
    let sharedXScale = null;
    if (seischartList.length != 0) {
      sharedXScale = seischartList[0].xScale;
    }
    seisMap.forEach(seis => {
      console.log("appendWaveform: "+seis[0].codes());
      const key = seis[0].codes();
      let seisGraph;
      if (this.get('isOverlay')) {
        seisGraph = seischartList[0];
      } else {
        seisGraph = seischartList.find( graph => {
          return graph.segments()[0].codes() === key;
        })
      }
      if (seisGraph ){
        seisGraph.append(seis);
        if (this.get('isOverlay')) {
          if (Array.isArray(seisGraph.title)) {
            seisGraph.setTitle(seisGraph.title.push(key));
            d3.select('#'+elementId).select("div").select(".seismogramInnerDiv").select("div").select("h5").text(key);
          } else {
            seisGraph.setTitle([ seisGraph.title, key ]);
          }
          seisGraph.draw();
          d3.select('#'+elementId).select("div").select(".seismogramInnerDiv").select("div").select("h5").text(key);
        }
      } else {
        // need to create
        seisGraph = this.initSeisChart(seis, key , sharedXScale);
        this.seischartList.push(seisGraph);
        d3.select('#'+elementId).select("div").select(".seismogramInnerDiv").select("div").select("h5").text(key);
      }
    })
  },
  initSeisChart: function(mseedRecords, title, sharedXScale) {
    let elementId = this.get('elementId');
    let titleDiv = d3.select('#'+elementId).select("div").select(".seismogramInnerDiv").append("div");
    if ( ! titleDiv) {
      throw new Error("Can't find titleDiv (id = "+elementId+")");
    }

    let startEndDates = this.calcStartEnd(mseedRecords, this.get('cookiejar'));
    titleDiv.append("h5").text(title);
    let svgDiv = titleDiv.append("div").classed("waveformPlot", true);
    let seischart = new waveformplot.Seismograph(svgDiv, mseedRecords, startEndDates.start, startEndDates.end);
    if (sharedXScale) {
      seischart.xScale = sharedXScale;
    }
    seischart.setTitle( [ title ] );
    seischart.draw();
    seischart.scaleChangeListeners.push(this);
    this.seischartList.push(seischart);
    return seischart;
  },
  drawPhases: function() {
      let that = this;
      return RSVP.hash({
        seisChartListHash: this.get('seischartList'),
        phaseHash: this.get('phases'),
        quakeHash: that.get('quake'),
        stationHash: that.get('station').get('network')
      }).then( () => {
        let seischartList = this.get('seischartList');
        if ( ! that.get('phases') || ! that.get('quake') || ! that.get('station') || ! that.get('station').get('network')) {
          // only overlay arrivals if we have quake, station and phases
          // but do delete old markers
          for (let cNum=0; cNum < seischartList.length; cNum++) {
            seischartList[cNum].clearMarkers();
          }
          return;
        }
        let phaseList = that.get('phases').split(',');
        let onlyFirstP = phaseList.find(p => p === 'firstP');
        let onlyFirstS = phaseList.find(p => p === 'firstS');
        if (onlyFirstP) {
          phaseList = phaseList.filter(p => p != 'firstP')
              .concat(['P', 'p', 'Pdiff', 'PKP', 'PKIKP']);
        }
        if (onlyFirstS) {
          phaseList = phaseList.filter(p => p != 'firstS')
              .concat(['S', 's', 'Sdiff', 'SKS', 'SKIKS']);
        }
        return that.get('travelTime').calcTravelTimes(that.get('quake'), that.get('station'), "prem", phaseList.join())
          .then(function(json) {
            if (onlyFirstP) {
              let firstPArrival = json.included.find(a => a.attributes.phasename.startsWith('P') || a.attributes.phasename.startsWith('p'));
              json.included = json.included.filter( a => ! (a.attributes.phasename.startsWith('P') || a.attributes.phasename.startsWith('p')));
              json.included.push(firstPArrival);
            }
            if (onlyFirstS) {
              let firstSArrival = json.included.find(a => a.attributes.phasename.startsWith('S') || a.attributes.phasename.startsWith('s'));
              json.included = json.included.filter( a => ! (a.attributes.phasename.startsWith('S') || a.attributes.phasename.startsWith('s')));
              json.included.push(firstSArrival);
            }
            for (let cNum=0; cNum < seischartList.length; cNum++) {
              let markers = [];
              for (let aNum=0; aNum < json.included.length; aNum++) {
                let when = new Date(that.get('quake').get('prefOrigin').get('time').getTime()+json.included[aNum].attributes.traveltime*1000);
                markers.push({ id: json.included[aNum].id,
                               name: json.included[aNum].attributes.phasename,
                               markertype: 'predicted',
                               time: when });
              }
              // delete old markers
              seischartList[cNum].clearMarkers([]);
              seischartList[cNum].appendMarkers(markers);
            }
          });
      });
    },
    phasesObserver: observer('phases', function() {
      this.drawPhases();
    }),
    overlayObserver: observer('isOverlay', function() {
      this.updateGraph();
    }),
    rotateObserver: observer('isRotateGCP', function() {
      this.updateGraph();
    }),
    seismogramMapObserver: observer('seismogramMap', function() {
      console.log("seismogramMapObserver fire");
    //  this.updateGraph();
    }),
    notifyScaleChange(xScale) {
      this.seischartList.forEach( sc => {
        if ( sc.currZoomXScale != xScale) {
          sc.redrawWithXScale(xScale);
        }
      });
    },

    calcStartEnd: function(segments, cookieJar) {
      if (cookieJar && cookieJar.request) {
        let out = {
          start: cookieJar.request[0].start,
          end: cookieJar.request[0].end
        };
        for(let i=0; i<cookieJar.request.length; i++) {
          if (cookieJar.request[i].start < out.start) {
            out.start = cookieJar.request[i].start;
          }
          if (cookieJar.request[i].end > out.end) {
            out.end = cookieJar.request[i].end;
          }
        }
        return out;
      } else {
          return waveformplot.findStartEnd(segments);
      }
    },
    actions: {
      resetZoom() {
        let seischartList = this.get('seischartList');
        for (let cNum=0; cNum < seischartList.length; cNum++) {
            seischartList[cNum].resetZoom();
        }
      },
    }
});
