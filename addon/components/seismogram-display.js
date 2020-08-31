import Component from '@glimmer/component';
import { action } from '@ember/object';
import RSVP from 'rsvp';
import {d3, seismogram, seismographconfig, seismograph} from 'seisplotjs';

export default class SeismogramDisplayComponent extends Component {
  graph = null;

  @action
  createGraph(element) {
    this.doRedraw(element);
  }

  doRedraw(element) {
    let div = d3.select(element);
    if ( ! this.args.seismographConfig) {
        div.append('h5').text("SeismogramDisplay missing seismographConfig...");
    } else if ( ! this.args.seisDisplayData) {
        div.append('h5').text("SeismogramDisplay but no SDD...");
    } else {
      let seisDisplayDataList = [];
      if (Array.isArray(this.args.seisDisplayData)) {
        seisDisplayDataList = this.args.seisDisplayData;
      } else {
        seisDisplayDataList = [ this.args.seisDisplayData ];
      }
      let seisConfig;
      if (this.args.seismographConfig) {
        seisConfig = this.args.seismographConfig;
      } else {
        console.log("seisconfig missing from args");
        seisConfig = new seismographconfig.SeismographConfig();
        seisCondig.title = seismographconfig.DEFAULT_TITLE;
        seisConfig.wheelZoom = true;
        seisConfig.margin.top = 25;
      }
      if ( ! seisDisplayDataList || seisDisplayDataList.length === 0) {
        div.select("h5").text("No data...");
      } else {
        div.select("h5").remove();
        div.select("svg").remove();
        this.graph = new seismograph.Seismograph(div, seisConfig, seisDisplayDataList);
//        this.recalcTitle();
        this.graph.draw();
        if (this.graph.checkResize()) {
          this.graph.draw();
        }
      }
    }
  }

  @action updateGraph(element, [ seismographConfig, seisDisplayData, title ]) {
    this.doRedraw(element);
  }

}
