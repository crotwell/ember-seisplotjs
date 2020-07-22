import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ArrivalModel extends Model {
  @attr('string') phase;
  @belongsTo('pick') pick;
  @attr('string') publicId;
}
