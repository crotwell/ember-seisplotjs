import Model from 'ember-data/model';
import { computed } from '@ember/object';
import DS from 'ember-data';
import moment from 'moment';

export default Model.extend({
  stationCode: DS.attr('string'),
  network: DS.belongsTo('network', {async: true}),
  channels: DS.hasMany('channel', {async: true}),
  name: DS.attr('string'),
  description: DS.attr('string'),
  startTime: DS.attr('moment'),
  endTime: DS.attr('moment'),
  latitude: DS.attr('number'),
  longitude: DS.attr('number'),
  elevation: DS.attr('number'),

  isActive: computed('endTime', function() {
    return ! this.get('endTime') || ! this.get('endTime').isBefore(moment.utc());
  }),
  latitudeFormatted: computed('latitude', function() {
     return this.get('latitude').toFixed(2);
  }),
  longitudeFormatted: computed('longitude', function() {
     return this.get('longitude').toFixed(2);
  }),
  networkCode: computed('network', function() {
    return this.get('network').get('networkCode');
  }),
  codes: computed('stationCode', 'networkCode', function() {
    return this.get('networkCode')+"."+this.get('stationCode');
  }),
  activeAt: function(when) {
    if ( ! when) { when = moment.utc();}
    return this.get('startTime').isBefore(when)
      && ( ! this.get('endTime') || this.get('endTime').isAfter(when));
  },
});
