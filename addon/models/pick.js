import DS from 'ember-data';

export default DS.Model.extend({
  time:  DS.attr('moment'),
  networkCode: DS.attr('string'),
  stationCode: DS.attr('string'),
  locationCode: DS.attr('string'),
  channelCode: DS.attr('string'),
  publicId: DS.attr('string'),
  quake: DS.belongsTo('Quake'),
});
