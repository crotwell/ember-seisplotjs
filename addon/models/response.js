import Model from 'ember-data/model';
import DS from 'ember-data';

export default Model.extend({
  instrumentSensitivity: DS.attr(),
  stages: DS.attr()
});
