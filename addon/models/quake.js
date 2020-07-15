import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import moment from 'moment';

export default class QuakeModel extends Model {
  @attr('string') eventId;
  @attr('string') publicId;
  @attr('moment') time;
  @attr('number') latitude;
  @attr('number') longitude;
  @attr('number') depth;
  @attr('string') description;
  @belongsTo('Magnitude') preferredMagnitude;
  @attr('string') preferredMagnitudeID;
  @belongsTo('Origin') preferredOrigin;
  @hasMany('Magnitude') magnitudeList;
  @hasMany('Origin') originList;
  @hasMany('Arrival') arrivalList;
  @hasMany('Pick') pickList;
}
