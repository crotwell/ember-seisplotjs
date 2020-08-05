import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import moment from 'moment';

export default class ChannelModel extends Model {

  @attr('string') channelCode;
  @attr('string') locationCode;
  @belongsTo('station', {async: true}) station;
  @attr('string') name;
  @attr('string') description;
  @attr('moment') startTime;
  @attr('moment') endTime;
  @attr('number') latitude;
  @attr('number') longitude;
  @attr('number') elevation;
  @attr('number') depth;
  @attr('number') azimuth;
  @attr('number') dip;
  @attr('number') sampleRate;
  @attr('string') restrictedStatus;
  @attr() instrumentSensitivity;
  @belongsTo('response') response;
  @attr() sensor;
  @attr() preamplifier;
  @attr() datalogger;


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
    return this.get('station').get('networkCode');
  }
  get stationCode() {
    return this.get('station').get('stationCode');
  }
  get codes() {
    return this.get('networkCode')
      +"."+this.get('stationCode')
      +"."+this.get('locationCode')
      +"."+this.get('channelCode');
  }

  activeAt(when) {
    if ( ! when) {when = moment.utc();}
    return this.get('startTime').isBefore(when)
    && ( ! this.get('endTime') || this.get('endTime').isAfter(when));
   }
}
