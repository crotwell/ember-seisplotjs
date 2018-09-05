import Component from '@ember/component';
import { observer } from '@ember/object';
import RSVP from 'rsvp';
import layout from '../templates/components/seismogram-display';
import { inject as service } from '@ember/service';
import { computed } from "@ember/object";
import { getOwner } from "@ember/application";
import seisplotjs from 'ember-seisplotjs';
import moment from 'moment';

let miniseed = seisplotjs.miniseed;
let waveformplot = seisplotjs.waveformplot;
let d3 = waveformplot.d3;


export default Component.extend({
  fdsnDataSelect: service(),
  travelTime: service(),
  seismogramMap: null,
  channelMap: null,
  phases: null,
  isOverlay: false,
  isRotateGCP: false,
  isRMean: true,
  isGain: true,
  channels: [],
  quake: null,
  seischartList: [],
  distAzMap: new Map(),
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
  willRender() {
    this._super(...arguments);
    this.seischartList.forEach( sg => sg.draw());
  },

  updateGraph() {
    const that = this;
    this.seischartList = [];
    let elementId = this.get('elementId');
    d3.select('#'+elementId).select("div.seismogramInnerDiv").selectAll("div").remove();
    if (this.seismogramMap) {
      that.appendWaveformMap(this.seismogramMap);
    } else if (this.get('channel')) {
      this.channelMap.set(this.get('channel').codes, this.channel);
      //const ds = fdsnDataSelect;
      if (this.get('quake')) {

      } else {
        // no quake, so load realtime
        return this.loadDataForChannel(this.get('channel'))
          .then(seisMap => {
              that.appendWaveformMap(seisMap);
          });
      }
    }
  },
  loadData() {
    if (this.get('channel') && this.get('channel').length != 0) {
      // got channels
    }
    if (this.get('quake')) {
      let q = this.get('quake');
      let start = moment.utc(q.time);
      let duration = this.get('duration') ? this.get('duration') : 300;
      let end = start.add(duration, 'seconds');
      let chanTimeRange = [];

      this.get('fdsnDataSelect').postQuerySeismograms();
    }
  },
  loadDataForChannel(channel) {
    if ( ! channel instanceof seisplotjs.miniseed.model.Channel) {console.log("channel not a channel"); return;}
    console.log(`loadDataForChannel ${channel} ${channel.id}`);
    const ds = this.get('fdsnDataSelect');
    let seconds = 300;
    let sps = channel.sampleRate;
    if (sps > 1) {
      seconds = 300;
    } else if (sps <= .1) {
      seconds = 86400;
    } else {
      seconds = 3600;
    }
    return ds.load(channel, seconds, moment.utc());
  },
  loadDataForQuake(quake) {
    travelTime.load(quake, station, phaseList)
    .then( travelTimes => {

      return RSVP.hash({
        travelTime: travelTimes,

      })
    })
  },
  rotateToGCP(seismogramMap) {
    throw new Error("not yet impl");
  },

  appendWaveformMap: function(seisMap) {
    let that = this;
    let elementId = this.get('elementId');
    let seischartList = that.get('seischartList');
    let sharedXScale = null;
    if (seischartList.length != 0) {
      sharedXScale = seischartList[0].xScale;
    }
    for (let c of seisMap.keys()) {
      let chan = that.channelMap.get(c);
      this.distAzMap.set(c, seisplotjs.distaz.distaz(chan.latitude, chan.longitude, that.quake.latitude, that.quake.longitude));
    }
    let orderedKeys = Array.from(seisMap.keys()).sort((a,b) => {
      let chanA = that.channelMap.get(a);
      let chanB = that.channelMap.get(b);
      if (chanA && chanB && that.quake) {
        let distA = that.distAzMap.get(a);
        let distB = that.distAzMap.get(b);
        return distA.delta - distB.delta;
      } else {
        // alphabetical
        if (a < b) {
          return -1;
        } else if (b < a) {
          return 1;
        } else {
          return 0;
        }
      }
    });
    orderedKeys.forEach(key => {
      let seisArray = seisMap.get(key);

      if ( ! seisArray || seisArray.length === 0) {
        console.log(`empty for ${key} `);
        return;
      }
      let seisGraph;
      if (this.get('isOverlay')) {
        seisGraph = seischartList[0];
      } else {
        seisGraph = seischartList.find( graph => {
          return graph.segments[0].codes() === key;
        })
      }
      if (seisGraph ){
        seisGraph.append(seisArray);
        if (this.get('isOverlay')) {
          if (Array.isArray(seisGraph.title)) {
            seisGraph.setTitle(seisGraph.title.push(key));
          } else {
            seisGraph.setTitle([ seisGraph.title, `${key} (${this.distAzMap.get(key).delta})` ]);
          }
          seisGraph.draw();
        }
      } else {
        // need to create
        let distkm = Math.round(this.distAzMap.get(key).delta*seisplotjs.distaz.kmPerDeg);
        seisGraph = this.initSeisChart(seisArray, `${key} (${distkm} km)` , sharedXScale);
        this.seischartList.push(seisGraph);
        if (this.channelMap.has(key)) {
          seisGraph.setInstrumentSensitivity(this.channelMap.get(key).instrumentSensitivity);
        }
        if (this.get('quake')) {
          let markers = [];
          this.get('quake').preferredOrigin.get('arrivalList').forEach(arrival => {
            let p = arrival.pick;
            let chanCodes = `${p.get(`networkCode`)}.${p.get('stationCode')}.${p.get('locationCode')}.${p.get('channelCode')}`;
            if (chanCodes === key) {
              markers.push({ markertype: 'pick', name: arrival.phase, time: arrival.pick.get('time') });
            }
          });
          seisGraph.appendMarkers(markers);
        }
        seisGraph.draw();
      }
    });
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
    seischart.setDoRMean(this.isRMean);
    seischart.setDoGain(this.isGain);
    seischart.setTitle( [ title ] );
    seischart.scaleChangeListeners.push(this);
    this.seischartList.push(seischart);
    seischart.disableWheelZoom();
    seischart.maxHeight = 300;
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
    rMeanObserver: observer('isRMean', function() {
        let seischartList = this.get('seischartList');
        for (let graph of seischartList) {
          graph.setDoRMean(this.isRMean);
        }
    }),
    gainObserver: observer('isGain', function() {
        let seischartList = this.get('seischartList');
        for (let graph of seischartList) {
          graph.setDoGain(this.isGain);
        }
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
