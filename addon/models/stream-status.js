import Model from 'ember-data/model';
import { computed } from '@ember/object';
import DS from 'ember-data';
import moment from 'moment';

export default Model.extend({
  key: DS.attr('string'),
  organization: DS.attr('string'),
  host: DS.attr('string'),
  earliest: DS.attr('utc'),
  latest: DS.attr('utc'),
  accessTime: DS.attr('utc'),
  latency: computed('latest', 'accessTime', function() {
    return moment.duration(this.get('latest').diff(this.get('accessTime')));
  }),
  latencyHumanize: computed('latency', function() {
    return this.get('latency').humanize();
  }),
});
