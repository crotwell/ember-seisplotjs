import DS from 'ember-data';

export default DS.Model.extend({
  phase: DS.attr('string'),
  pick: DS.belongsTo('pick'),
  publicId: DS.attr('string'),
});
