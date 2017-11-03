import Model from 'ember-data/model';
import DS from 'ember-data';

export default Model.extend({
  stationCode: DS.attr('string'),
  network: DS.belongsTo('network', {async: true}),
  channels: DS.hasMany('channel', {async: true}),
  name: DS.attr('string'),
  description: DS.attr('string'),
  startTime: DS.attr('date'),
  endTime: DS.attr('date'),
  latitude: DS.attr('number'),
  longitude: DS.attr('number'),
  elevation: DS.attr('number'),

  latitudeFormatted:  function() {
     return this.get('latitude').toFixed(2);
  }.property('latitude'),
  longitudeFormatted:  function() {
     return this.get('longitude').toFixed(2);
  }.property('longitude'),
  codes: function() {
    return this.get('network').get('networkCode')+"."+this.get('stationCode');
  }.property('stationCode', 'network.networkCode'),
  createId: function() {
    return this.codes()+"_"+this.startTime().toISOString();
  }.property('codes', 'startTime')
});
