import DS from 'ember-data';

export default DS.Model.extend({
      eventid: DS.attr('string'),
      publicID: DS.attr('string'),
      time: DS.attr('moment'),
      latitude: DS.attr('number'),
      longitude: DS.attr('number'),
      depth: DS.attr('number'),
      description: DS.attr('string'),
      prefMagnitude: DS.belongsTo('Magnitude'),
      preferredMagnitudeID: DS.attr('string'),
      prefOrigin: DS.belongsTo('Origin'),
      magnitudeList: DS.hasMany('Magnitude'),
      originList: DS.hasMany('Origin'),
      arrivalList: DS.hasMany('Arrival'),
      pickList: DS.hasMany('Pick'),
});
