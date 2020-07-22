import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import moment from 'moment';
import Quake from './quake';

export default class PickModel extends Model {
  @attr('moment') time;
  @attr('string') networkCode;
  @attr('string') stationCode;
  @attr('string') locationCode;
  @attr('string') channelCode;
  @attr('string') publicId;
  @belongsTo('Quake') quake;

}
