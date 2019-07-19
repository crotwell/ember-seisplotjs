import JSONAPISerializer from 'ember-data/serializers/json-api';

import seisplotjs from 'ember-seisplotjs';
const moment = seisplotjs.moment;

export default JSONAPISerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    if (requestType === 'findRecord') {
      return this.normalize(primaryModelClass, payload);
    } else {
      const mythis = this;
      return payload.reduce(function(documentHash, item) {
        let { data, included } = mythis.normalize(primaryModelClass, item);
        documentHash.included.push(...included);
        documentHash.data.push(data);
        return documentHash;
      }, { data: [], included: [] });
    }
  },
  normalize(modelClass, resourceHash) {
    if (modelClass.modelName === "stream-status") {
      return this.normalizeStreamStatus(resourceHash);
    }
  },
  normalizeStreamStatus(resourceHash) {
    const data = {
      id: resourceHash.key,
      type: 'stream-status',
      attributes: {
          key: resourceHash.key,
          organization: resourceHash.rsid.serverId,
          host: resourceHash.rsid.host,
          port: resourceHash.rsid.port,
          earliest: this.createMoment(resourceHash.startRaw),
          latest: this.createMoment(resourceHash.endRaw),
          accessTime: this.createMoment(resourceHash.rsid.accessTime)
      }
    };
    const included = [];
    return { data: data, included: included };
  },
  serialize(snapshot, options) {
    var json = {
      id: snapshot.id
    };

    snapshot.eachAttribute((key, attribute) => {
      json[key] = snapshot.attr(key);
    });

    snapshot.eachRelationship((key, relationship) => {
      if (relationship.kind === 'belongsTo') {
        json[key] = snapshot.belongsTo(key, { id: true });
      } else if (relationship.kind === 'hasMany') {
        json[key] = snapshot.hasMany(key, { ids: true });
      }
    });

    return json;
  },
  createMoment(dateStr) {
    if (/.*[0-9]$/.test(dateStr)) {
      dateStr = dateStr+'Z';
    }
    return moment.utc(dateStr);
  }
});
