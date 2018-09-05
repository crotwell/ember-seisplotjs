import { computed } from '@ember/object';
import Model from 'ember-data/model';
import DS from 'ember-data';

export default Model.extend({
  networkCode: DS.attr('string'),
  startTime: DS.attr('moment'),
  endTime: DS.attr('moment'),
  description: DS.attr('string'),
  stations: DS.hasMany('station', { async: true }),

  isActive: function() {
    return ! this.get('endTime') || ! this.get('endTime').isBefore(moment.utc());
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
  }),
  activeAt: function(when) {
    if ( ! when) {when = moment.utc();}
    return this.get('startTime').isBefore(when)
      && ( ! this.get('endTime') || this.get('endTime').isAfter(when));
  },
});
