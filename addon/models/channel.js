import Model from 'ember-data/model';
import DS from 'ember-data';

export default Model.extend({

  channelCode: DS.attr('string'),
  locationCode: DS.attr('string'),
  station: DS.belongsTo('network', {async: true}),
  name: DS.attr('string'),
  description: DS.attr('string'),
  startTime: DS.attr('date'),
  endTime: DS.attr('date'),
  latitude: DS.attr('number'),
  longitude: DS.attr('number'),
  elevation: DS.attr('number'),
  depth: DS.attr('number'),
  azimuth: DS.attr('number'),
  dip: DS.attr('number'),
  sampleRate: DS.attr('number'),
  restrictedStatus: DS.attr('string'),
  instrumentSensitivity: DS.attr(),
  response: DS.belongsTo('response'),

  latitudeFormatted:  function() {
     return this.get('latitude').toFixed(2);
  }.property('latitude'),
  longitudeFormatted:  function() {
     return this.get('longitude').toFixed(2);
  }.property('longitude'),
  codes: function() {
    return this.get('station').get('network').get('networkCode')
      +"."+this.get('station').get('stationCode')
      +"."+this.get('locationCode')
      +"."+this.get('channelCode');
  }.property('station.stationCode',
             'station.network.networkCode',
             'locationCode',
             'channelCode')
});
