import Model, { attr, belongsTo } from '@ember-data/model';

export default class ResponseModel extends Model {
  @attr() instrumentSensitivity;
  @attr() stages;
}
