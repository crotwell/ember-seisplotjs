import Component from '@glimmer/component';
import { action } from '@ember/object';
import RSVP from 'rsvp';
import {d3, seismogram, seismographconfig, seismograph} from 'seisplotjs';

export default class SeismogramDisplayComponent extends Component {

  @action
  createGraph(element) {
    console.log(`createGraph`);
    let div = d3.select(element);
    if (this.args.seisDisplayData) {
      let seisDisplayDataList = [];
      if (Array.isArray(this.args.seisDisplayData)) {
        console.log(`SeismogramDisplayComponent is array`);
        seisDisplayDataList = this.args.seisDisplayData;
      } else {
        console.log(`SeismogramDisplayComponent is NOT array`);
        seisDisplayDataList = [ this.args.seisDisplayData ];
      }
      let seisConfig = new seismographconfig.SeismographConfig();
      seisConfig.wheelZoom = false;
      if (this.args.title) {
        seisConfig.title = this.args.title;
      } else {
        let channels = seisDisplayDataList.map(sdd => sdd.channel);
        if (channels) {
          seisConfig.title = "";
          channels.forEach( c => {
            seisConfig.title += c.locationCode+"."+c.channelCode;
          });
        } else {
          seisConfig.title = "no channels...";
        }
      }
      seisConfig.margin.top = 25;
      if ( ! seisDisplayDataList) {
        console.error(`quakeVector.waveforms is null`);
      } else {
        console.log(`quakeVector waveforms ${seisDisplayDataList.length}`);
      }
      //let seis = seismogram.Seismogram.createFromContiguousData(dataArray, sampleRate, start);
      //let waveforms = await RSVP.all(Array.from(this.args.quakeVector.waveforms));
      if ( ! seisDisplayDataList || seisDisplayDataList.length === 0) {
        div.select("h5").text("No data...");
      } else {
        div.select("h5").remove();
        let graph = new seismograph.Seismograph(div, seisConfig, seisDisplayDataList);
        graph.draw();
        if (graph.checkResize()) {
          graph.draw();
        }
      }
    } else {
      div.append('p').text("SeismogramDisplay but no SDD...");
    }
  }
}
