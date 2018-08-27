import DS from 'ember-data';

export default DS.Model.extend({
  publicId: DS.attr('string'),
  mag: DS.attr('number'),
  type: DS.attr('string'),
  quake: DS.belongsTo('Quake', {inverse: 'prefMagnitude'}),
});
