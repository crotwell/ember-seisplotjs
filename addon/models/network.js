import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import moment from 'moment';

export default class NetworkModel extends Model {
  @attr('string') networkCode;
  @attr('moment') startTime;
  @attr('moment') endTime;
  @attr('string') description;
  @hasMany('station', {async: true}) stations;


  get isActive() {
    return ! this.endTime || ! this.endTime.isBefore(moment.utc());
  }
  get isTempNet() {
    var first = this.networkCode.charAt(0);
    return first === 'X' || first === 'Y' || first === 'Z';
  }
  get startYear() {
      return this.startTime.toISOString().substring(0,4);
  }
  get startTimeUTC() {
    var s = this.startTime;
    if(s === null) {
      return "";
    } else {
      return s.toISOString();
    }
  }
  get endTimeUTC() {
    if(this.endTime === null) {
      return "";
    } else {
      return this.endTime.toISOString();
    }
  }
  activeAt(when) {
    if ( ! when) {when = moment.utc();}
    return this.startTime.isBefore(when)
      && ( ! this.endTime || this.endTime.isAfter(when));
  }
}
