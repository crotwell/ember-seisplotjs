import Transform from 'ember-data/transform';
import moment from 'moment';

export default Transform.extend({
  deserialize(serialized) {
  console.log("in utc transform "+serialized);
    return serialized ? moment.utc(serialized) : null;
  },

  serialize(deserialized) {
    return deserialized ? deserialized.toJSON() : null;
  }
});
