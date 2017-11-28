import Model from 'ember-data/model';
import DS from 'ember-data';
import moment from 'moment';
import humanize from 'ember-moment/computeds/humanize';

export default Model.extend({
  key: DS.attr('string'),
  organization: DS.attr('string'),
  host: DS.attr('string'),
  earliest: DS.attr('utc'),
  latest: DS.attr('utc'),
  accessTime: DS.attr('utc'),
  latency: function() {
    return moment.duration(this.get('latest').diff(this.get('accessTime')));
  }.property('latest', 'accessTime'),
  latencyHumanize: function() {
    return this.get('latency').humanize();
  }.property('latency'),
});
