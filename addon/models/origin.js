import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import moment from 'moment';
import Arrival from './arrival';

export default class OriginModel extends Model {

  @attr('string') publicId;
  @attr('moment') time;
  @attr('number') latitude;
  @attr('number') longitude;
  @attr('number') depth;
  @hasMany('Arrival') arrivalList;

// ToDo maybe use format-number helper instead
  get latitudeFormatted() {
     return this.latitude.toFixed(2);
  }
  get longitudeFormatted() {
     return this.longitude.toFixed(2);
  }
  get depthFormatted() {
     return this.depth.toFixed(2);
  }
}
