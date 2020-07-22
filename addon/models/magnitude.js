import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class MagnitudeModel extends Model {
    @attr('number') mag;
    @attr('string') magType;
    @belongsTo('quake', {inverse: 'magnitudeList'}) quake;
    @attr('string') publicId;
}
