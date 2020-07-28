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
    return ! this.get('endTime') || ! this.get('endTime').isBefore(moment.utc());
  }
  get latitudeFormatted() {
     return this.get('latitude').toFixed(2);
  }
  get longitudeFormatted() {
     return this.get('longitude').toFixed(2);
  }
  get networkCode() {
    return this.get('network').get('networkCode');
  }
  get codes() {
    return this.get('networkCode')+"."+this.get('stationCode');
  }
  activeAt(when) {
    if ( ! when) { when = moment.utc();}
    return this.get('startTime').isBefore(when)
      && ( ! this.get('endTime') || this.get('endTime').isAfter(when));
  }
}
