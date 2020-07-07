import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class NetworkModel extends Model {
  @attr networkCode;
  @attr('date') startTime;
  @attr('date') endTime;
  @attr description;
  @hasMany('station', {async: true}) stations;


  get isActive() {
    return ! this.get('endTime') || ! this.get('endTime').isBefore(moment.utc());
  }
  get isTempNet() {
    var first = this.get('networkCode').charAt(0);
    return first === 'X' || first === 'Y' || first === 'Z';
  }
  get startYear() {
      return this.get('startTime').toISOString().substring(0,4);
  }
  get startTimeUTC() {
    var s = this.get('startTime');
    if(s === null) {
      return "";
    } else {
      return s.toISOString();
    }
  }
  get endTimeUTC() {
    if(this.get('endTime') === null) {
      return "";
    } else {
      return this.get('endTime').toISOString();
    }
  }
  activeAt(when) {
    if ( ! when) {when = moment.utc();}
    return this.get('startTime').isBefore(when)
      && ( ! this.get('endTime') || this.get('endTime').isAfter(when));
  }
}
