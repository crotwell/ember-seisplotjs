import JSONAPISerializer from 'ember-data/serializers/json-api';

export default JSONAPISerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    console.log("fdsnstation serializer normalizeResponse "+primaryModelClass);
    if (requestType === 'findRecord') {
      return this.normalize(primaryModelClass, payload);
    } else {
      return payload.reduce(function(documentHash, item) {
        let { data, included } = this.normalize(primaryModelClass, item);
        documentHash.included.push(...included);
        documentHash.data.push(data);
        return documentHash;
      }, { data: [], included: [] })
    }
  },
  normalize(modelClass, resourceHash) {
    var data;
    console.log("network serializer normalize "+modelClass.modelName);
    if (modelClass.modelName === "network") {
      console.log("")
      data = {
        id: resourceHash.networkCode(),
        type: modelClass.modelName,
        attributes:    {
            networkCode: resourceHash.networkCode(),
            startTime: resourceHash.startDate(),
            endTime: resourceHash.endDate(),
            description: resourceHash.description()
        },
        relationships: {
          stations: {
            links: {
              related: resourceHash.stationsURL
            }
          },
        }
      };
    } else {
      console.log("serializer normalize else");
      data = {
      id:            resourceHash.id,
      type:          modelClass.modelName,
      attributes:    resourceHash
    };
    }
    return { data: data };
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
  }
});
