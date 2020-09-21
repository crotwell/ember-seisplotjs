import Component from '@glimmer/component';
import { action } from '@ember/object';
import RSVP from 'rsvp';
import {d3, seismogram, seismographconfig, seismograph} from 'seisplotjs';


export default class OrganizedDisplayComponent extends Component {


  @action
  createGraph(element) {
    this.doRedraw(element);
  }

  @action updateGraph(element, [organized]) {
    this.doRedraw(element);
  }

  doRedraw(element) {
    this.args.organized.plot(d3.select(element));
  }
}
