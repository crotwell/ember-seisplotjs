import JSONAPISerializer from 'ember-data/serializers/json-api';

export default JSONAPISerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    console.log("fdsnstation serializer normalizeResponse "+requestType+" "+primaryModelClass.modelName);
    if (requestType === 'findRecord') {
      return this.normalize(primaryModelClass, payload);
    } else if (requestType === 'findHasMany') {
      if (primaryModelClass.modelName === 'station') {
        let net = payload[0];
        let out = [];
        for (const st of net.stations()) {
          console.log("normalizeResponse push station "+st.codes());
          out.push(this.normalizeStation(st).data);
        }
        console.log("finish normalizeResponse "+out.length+" "+requestType+" "+primaryModelClass.modelName);
for (const x of out) {
  console.log(x.type+"   id "+x.id);
}
        return { data: out };
      } else {
        throw new Error("unknown modelName for normalizeResponse findHasMany "+primaryModelClass.modelName);
      }
    } else {
      console.log("normalizeResponse "+requestType);
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
    console.log("fdsnstation serializer normalize "+modelClass.modelName);
    let net = resourceHash;
    if (Array.isArray(resourceHash)) {
      console.log("fdsnstation serializer normalize resourceHash is Array "+resourceHash.length);
      net = resourceHash[0];
    }
    if (modelClass.modelName === "network") {
      return this.normalizeNetwork(net);
    } else if (modelClass.modelName === "station") {
      if ( ! net.stations() || net.stations().length != 1) {
        throw new Error("unable to normalize station, not single station: "+net.stations());
      }
      return this.normalizeStation(net.stations()[0]);
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
      let sta = net.stations()[0];
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
      id: this.createNetworkId(net),
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
            related: this.NET_STATIONS_URL
          }
        },
      }
    };
    const included = [];
    console.log("included stations: "+net.stations().length);
    if (net.stations() && net.stations().length != 0) {
      for (const s of net.stations()) {
        const staNorm = this.normalizeStation(s);
        console.log("push station: "+s.codes()+" id "+staNorm.data.id);
        included.push(staNorm.data);
      }
    }
    return { data: data, included: included };
  },
  normalizeStation(sta) {
    console.log("normalizeStation "+sta.codes()+" id: "+this.createStationId(sta));
    const data = {
      id: this.createStationId(sta),
      type: 'station',
      attributes: {
        stationCode: sta.stationCode(),
        startTime: sta.startDate(),
        endTime: sta.endDate(),
        name: sta.name(),
        latitude: sta.latitude(),
        longitude: sta.longitude(),
        elevation: sta.elevation()
      },
      relationships: {
        network: {
          links: {
            related: this.STA_NETWORK_URL
          },
          data: {
            type: 'network',
            id: this.createNetworkId(sta.network())
          }
        },
        channels: {
          links: {
            related: this.STA_CHANNELS_URL
          }
        },
      }
    };
    const included = [];
    if (sta.channels() && sta.channels().length != 0) {
      for (const c of sta.channels()) {
        console.log("push channel: "+c.codes());
        included.push(this.normalizeChannel(c).data);
      }
    }
    return { data: data, included: included };
  },
  normalizeChannel(chan) {
    const data = {
      id: this.createChannelId(chan),
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
          data: {
            type: 'station',
            id: this.createStationId(chan.station())
          },
          links: {
            related: this.CHAN_STATION_URL
          }
        },
        response: {
          links: {
            related: this.CHAN_RESPONSE_URL
          }
        },
      }
    };
    const included = [];
    if (chan.response() && chan.response().stages() && chan.response().stages().length > 0) {
      included.push(this.normalizeChannelResponse(chan.response(), data.id).data);
    }
    return { data: data, included: included };
  },
  normalizeChannelResponse(resp, chanId) {
    console.log("normalizeChannelResponse");
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
  },
  createNetworkId: function(spjsNet) {
    if (spjsNet.isTempNet()) {
      // append year if temp
      return spjsNet.codes()+"_"+spjsNet.startDate().toISOString().substring(0,4);
    } else {
      return spjsNet.codes();
    }
  },
  createStationId: function(spjsStation) {
    return this.createNetworkId(spjsStation.network())
      +"."+spjsStation.stationCode()
      +"_"+spjsStation.startDate().toISOString();
  },
  createChannelId: function(spjsChannel) {
    return this.createStationId(spjsChannel.station())
      +"."+spjsChannel.locationCode()
      +"."+spjsChannel.channelCode()
      +"_"+spjsChannel.startDate().toISOString();
  },
  NET_STATIONS_URL: "seisplotjs:net.stationsURL",
  STA_NETWORK_URL: "seisplotjs:sta.networkURL",
  STA_CHANNELS_URL: "seisplotjs:sta.channelsURL",
  CHAN_STATION_URL: "seisplotjs:chan_stationURL",
  CHAN_RESPONSE_URL: "seisplotjs:chan_responseURL",
});
