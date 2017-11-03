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
    console.log("fdsnstation serializer normalize "+modelClass.modelName);
    let net = resourceHash;
    if (modelClass.modelName === "network") {
      return this.normalizeNetwork(resourceHash);
    } else if (modelClass.modelName === "station") {
      if ( ! net.stations() || net.stations().length != 1) {
        throw new Error("unable to normalize station, not single station: "+net.stations());
      }
      return this.normalizeStation(resourceHash.stations()[0]);
    } else if (modelClass.modelName === "channel") {
      if ( ! net.stations() || net.stations().length != 1) {
        throw new Error("unable to normalize channel, not single station: "+net.stations());
      }
      let sta = net.stations()[0];
      if ( ! sta || sta.channels().length != 1) {
        throw new Error("unable to normalize channel, not single channel: "+sta.channels());
      }
      return this.normalizeChannel(sta.channels()[0]);
    } else if (modelClass.modelName === "response") {
      if ( ! net.stations() || net.stations().length != 1) {
        throw new Error("unable to normalize channel, not single station: "+net.stations());
      }
      let sta = resourceHash.stations()[0];
      if ( ! sta || sta.channels().length != 1) {
        throw new Error("unable to normalize channel, not single channel: "+sta.channels());
      }
      return this.normalizeChannelResponse(sta.channels()[0].response(), sta.channels()[0].createId());
    }
    throw new Error("fdsnstation serializer unknown type to normalize: "+resourceHash.id
      +" "+modelClass.modelName);
  },
  normalizeNetwork(net) {
    const data = {
      id: net.createId(),
      type: 'network',
      attributes: {
          networkCode: net.networkCode(),
          startTime: net.startDate(),
          endTime: net.endDate(),
          description: net.description()
      },
      relationships: {
        stations: {
          links: {
            related: net.urls.stationsURL
          }
        },
      }
    };
    const included = [];
    if (net.stations() && net.stations().length != 0) {
      for (const s of net.stations()) {
        included.push(this.normalizeStation(s).data);
      }
    }
    return { data: data, included: included };
  },
  normalizeStation(sta) {
    const data = {
      id: sta.createId(),
      type: 'station',
      attributes: {
        stationCode: sta.stationCode(),
        startTime: sta.startDate().toJSON(),
        endTime: sta.endDate().toJSON(),
        name: sta.name(),
        latitude: sta.latitude(),
        longitude: sta.longitude(),
        elevation: sta.elevation()
      },
      relationships: {
        network: {
          links: {
            related: sta.network.urls.networkURL
          },
          data: {
            type: 'network',
            id: sta.network().createId()
          }
        },
        channels: {
          links: {
            related: sta.network().urls.channelsURL
          }
        },
      }
    };
    const included = [];
    if (sta.channels() && sta.channels().length != 0) {
      for (const c of sta.channels()) {
        included.push(this.normalizeChannel(c).data);
      }
    }
    return { data: data, included: included };
  },
  normalizeChannel(chan) {
    const data = {
      id: chan.createId(),
      type: 'channel',
      attributes: {
        channelCode: chan.channelCode(),
        locationCode: chan.locationCode(),
        instrumentSensitivity: chan.instrumentSensitivity(),
        startTime: chan.startDate(),
        endTime: chan.endDate(),
        latitude: chan.latitude(),
        longitude: chan.longitude(),
        elevation: chan.elevation(),
        depth: chan.depth(),
        azimuth: chan.azimuth(),
        dip: chan.dip(),
        sampleRate: chan.sampleRate(),
        restrictedStatus: chan.restrictedStatus(),
      },
      relationships: {
        station: {
          links: {
            related: chan.network().urls.stationURL
          }
        },
        response: {
          links: {
            related: chan.network().urls.responseURL
          }
        },
      }
    };
    const included = [];
    if (chan.response() && chan.response().stages() && chan.response().stages().length > 0) {
      included.push(this.normalizeChannelResponse(chan.response(), chan.createId()).data);
    }
    return { data: data, included: included };
  },
  normalizeChannelResponse(resp, chanId) {
    if ( ! chanId) {throw new Error("ChannelId is not defined: "+chanId);}
    const data = {
      id: chanId,
      type: 'response',
      attributes:    {
          instrumentSensitivity: resp.instrumentSensitivity(),
          stages: resp.stages()
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
  }
});
