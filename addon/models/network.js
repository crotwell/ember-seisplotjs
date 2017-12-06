import { computed } from '@ember/object';
import Model from 'ember-data/model';
import DS from 'ember-data';

export default Model.extend({
  networkCode: DS.attr('string'),
  startTime: DS.attr('date'),
  endTime: DS.attr('date'),
  description: DS.attr('string'),
  stations: DS.hasMany('station', { async: true }),

  isActive: function() {
    return ! this.get('endTime').isBefore(Date.now());
  }.property('endTime'),
  isTempNet: computed('networkCode', function() {
    var first = this.get('networkCode').charAt(0);
console.log(' isTempNet : '+first);
    return first === 'X' || first === 'Y' || first === 'Z';
  }),
    startYear: computed('startTime', function() {
        return this.get('startTime').toISOString().substring(0,4);
    }),
  startTimeUTC: computed('startTime', function() {
    var s = this.get('startTime');
    if(s === null) {
      return "";
    } else {
      return s.toISOString();
    }
  }),
  endTimeUTC: computed('endTime', function() {
    if(this.get('endTime') === null) {
      return "";
    } else {
      return this.get('endTime').toISOString();
    }
  })
});
