import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import moment from 'moment';

export default class StationModel extends Model {
  @attr('string') stationCode;
  @attr('moment') startTime;
  @attr('moment') endTime;
  @attr('string') name;
  @attr('string') description;
  @attr site;
  @belongsTo('network', {async: true}) network;
  @hasMany('channel', {async: true}) channels;
  @hasMany('quakeStation', {async: true}) quakeStationPairs;
  @attr('number') latitude;
  @attr('number') longitude;
  @attr('number') elevation;


  get isActive() {
    return ! this.endTime || ! this.endTime.isBefore(moment.utc());
  }
  get latitudeFormatted() {
     return this.latitude.toFixed(2);
  }
  get longitudeFormatted() {
     return this.longitude.toFixed(2);
  }
  get networkCode() {
    return this.network.get('networkCode');
  }
  get codes() {
    return this.networkCode+"."+this.stationCode;
  }
  activeAt(when) {
    if ( ! when) { when = moment.utc();}
    return this.startTime.isBefore(when)
      && ( ! this.endTime || this.endTime.isAfter(when));
  }
}
