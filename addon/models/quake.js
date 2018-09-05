import DS from 'ember-data';

export default DS.Model.extend({
      eventId: DS.attr('string'),
      publicId: DS.attr('string'),
      time: DS.attr('moment'),
      latitude: DS.attr('number'),
      longitude: DS.attr('number'),
      depth: DS.attr('number'),
      description: DS.attr('string'),
      prefMagnitude: DS.belongsTo('Magnitude'),
      preferredMagnitudeID: DS.attr('string'),
      preferredOrigin: DS.belongsTo('Origin'),
      magnitudeList: DS.hasMany('Magnitude'),
      originList: DS.hasMany('Origin'),
      arrivalList: DS.hasMany('Arrival'),
      pickList: DS.hasMany('Pick'),
});
