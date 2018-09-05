import DS from 'ember-data';

export default DS.Model.extend({
  publicId: DS.attr('string'),
  time: DS.attr('moment'),
  latitude: DS.attr('number'),
  longitude: DS.attr('number'),
  depth: DS.attr('number'),
  arrivalList: DS.hasMany('Arrival'),
});
