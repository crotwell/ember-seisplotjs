import Component from '@glimmer/component';
import { action } from '@ember/object';
import RSVP from 'rsvp';
import {d3, seismogram, seismographconfig, seismograph} from 'seisplotjs';

export default class SeismogramDisplayComponent extends Component {
  graph = null;

  @action
  createGraph(element) {
    let div = d3.select(element);
    if (this.args.seisDisplayData) {
      let seisDisplayDataList = [];
      if (Array.isArray(this.args.seisDisplayData)) {
        seisDisplayDataList = this.args.seisDisplayData;
      } else {
        seisDisplayDataList = [ this.args.seisDisplayData ];
      }
      let seisConfig = new seismographconfig.SeismographConfig();
      seisConfig.wheelZoom = false;
      seisConfig.margin.top = 25;
      if ( ! seisDisplayDataList) {
      } else {
      }
      //let seis = seismogram.Seismogram.createFromContiguousData(dataArray, sampleRate, start);
      //let waveforms = await RSVP.all(Array.from(this.args.quakeVector.waveforms));
      if ( ! seisDisplayDataList || seisDisplayDataList.length === 0) {
        div.select("h5").text("No data...");
      } else {
        div.select("h5").remove();
        this.graph = new seismograph.Seismograph(div, seisConfig, seisDisplayDataList);
        this.recalcTitle();
        this.graph.draw();
        if (this.graph.checkResize()) {
          this.graph.draw();
        }
      }
    } else {
      div.append('p').text("SeismogramDisplay but no SDD...");
    }
  }

  @action updateGraph(element, [ title ]) {
    this.recalcTitle();
    this.graph.drawTitle();
  }

  recalcTitle() {
    if ( ! this.graph ) {return;}
    if (this.args.title) {
      this.graph.seismographConfig.title = this.args.title;
    } else {
      let channels = this.graph.seisDataList.map(sdd => sdd.channel);
      if (channels) {
        this.graph.seismographConfig.title = "";
        channels.forEach( c => {
          this.graph.seismographConfig.title += c.locationCode+"."+c.channelCode;
        });
      } else {
        this.graph.seismographConfig.title = "no channels...";
      }
    }
  }
}
