import JSONAPISerializer from 'ember-data/serializers/json-api';

import seisplotjs from 'ember-seisplotjs';
import moment from 'moment';
//const moment = seisplotjs.model.moment;

export default JSONAPISerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    if (requestType === 'findRecord') {
      return this.normalize(primaryModelClass, payload);
    } else if (requestType === 'query' || requestType === 'findHasMany') {
      if (primaryModelClass.modelName === 'station') {
        let out = [];
        let included = [ ];
        for (const net of payload) {
          for (const st of net.stations) {
            const normSta = this.normalizeStation(st);
            out.push(normSta.data);
          }
          included.push(this.normalizeNetwork(net).data );
        }
        return { data: out, included: included };
      } else if (primaryModelClass.modelName === 'channel') {

        let out = [];
        let included = [ ];
        for (const net of payload) {
          for (const st of net.stations) {
            for (const ch of st.channels) {
              const normCh = this.normalizeChannel(ch);
              out.push(normCh.data);
            }
            included.push(this.normalizeStation(st).data );
          }
          included.push(this.normalizeNetwork(net).data );
        }
        return { data: out, included: included };
      } else {
        throw new Error("unknown modelName for normalizeResponse findHasMany "+primaryModelClass.modelName);
      }
    } else {
      console.log(`fdsnstation serializer nomalizeResponse rt=${requestType} payload=${payload}`);
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
    let net = resourceHash;
    if (Array.isArray(resourceHash)) {
      net = resourceHash[0];
    }
    if (modelClass.modelName === "network") {
      return this.normalizeNetwork(net);
    } else if (modelClass.modelName === "station") {
      if ( ! net.stations || net.stations.length != 1) {
        throw new Error("unable to normalize station, not single station: "+net.stations.length);
      }
      let out = this.normalizeStation(net.stations[0]);
      out.included.push(this.normalizeNetwork(net).data);
      return out;
    } else if (modelClass.modelName === "channel") {
      if ( ! net.stations || net.stations.length != 1) {
        throw new Error("unable to normalize channel, not single station: "+net.stations.length);
      }
      let sta = net.stations[0];
      if ( ! sta || sta.channels.length != 1) {
        throw new Error("unable to normalize channel, not single channel: "+sta.channels.length);
      }
      let out = this.normalizeChannel(sta.channels[0]);
      out.included.push(this.normalizeNetwork(net).data);
      out.included.push(this.normalizeStation(sta).data);
      return out;
    } else if (modelClass.modelName === "response") {
      if ( ! net.stations || net.stations.length != 1) {
        throw new Error("unable to normalize channel, not single station: "+net.stations);
      }
      let sta = net.stations[0];
      if ( ! sta || sta.channels.length != 1) {
        throw new Error("resp unable to normalize channel, not single channel: "+sta.channels.length);
      }
      let out = this.normalizeChannelResponse(sta.channels[0].response, sta.channels[0].createId());
      out.included.push(this.normalizeNetwork(net).data);
      out.included.push(this.normalizeStation(sta).data);
      out.included.push(this.normalizeChannel(sta.channels[0]).data);
      return out;
    }
    throw new Error("fdsnstation serializer unknown type to normalize: "+resourceHash.id
      +" "+modelClass.modelName);
  },
  normalizeNetwork(net) {
    const data = {
      id: this.createNetworkId(net),
      type: 'network',
      attributes: {
          networkCode: net.networkCode,
          startTime: net.startDate,
          endTime: net.endDate,
          description: net.description
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
    if (net.stations && net.stations.length != 0) {
      for (const s of net.stations) {
        const staNorm = this.normalizeStation(s);
        included.push(staNorm.data);
      }
    }
    return { data: data, included: included };
  },
  normalizeStation(sta) {
    const data = {
      id: this.createStationId(sta),
      type: 'station',
      attributes: {
        stationCode: sta.stationCode,
        startTime: sta.startDate,
        endTime: sta.endDate,
        name: sta.name,
        latitude: sta.latitude,
        longitude: sta.longitude,
        elevation: sta.elevation
      },
      relationships: {
        network: {
          links: {
            related: this.STA_NETWORK_URL
          },
          data: {
            type: 'network',
            id: this.createNetworkId(sta.network)
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
    if (sta.channels && sta.channels.length != 0) {
      for (const c of sta.channels) {
        included.push(this.normalizeChannel(c).data);
      }
    }
    const out = { data: data, included: included };
    return out;
  },
  normalizeChannel(chan) {
    const data = {
      id: this.createChannelId(chan),
      type: 'channel',
      attributes: {
        channelCode: chan.channelCode,
        locationCode: chan.locationCode,
        instrumentSensitivity: chan.instrumentSensitivity,
        startTime: chan.startDate,
        endTime: chan.endDate,
        latitude: chan.latitude,
        longitude: chan.longitude,
        elevation: chan.elevation,
        depth: chan.depth,
        azimuth: chan.azimuth,
        dip: chan.dip,
        sampleRate: chan.sampleRate,
        restrictedStatus: chan.restrictedStatus,
      },
      relationships: {
        station: {
          data: {
            type: 'station',
            id: this.createStationId(chan.station)
          },
          links: {
            related: this.CHAN_STATION_URL
          }
        },
        response: {
          data: {
            type: 'response',
            id: this.createChannelId(chan)
          },
          links: {
            related: this.CHAN_RESPONSE_URL
          }
        },
      }
    };
    const included = [];
    if (chan.response && chan.response.stages && chan.response.stages.length > 0) {
      included.push(this.normalizeChannelResponse(chan.response, data.id).data);
    }
    return { data: data, included: included };
  },
  normalizeChannelResponse(resp, chanId) {
    if ( ! chanId) {throw new Error("ChannelId is not defined: "+chanId);}
    const data = {
      id: chanId,
      type: 'response',
      attributes:    {
          instrumentSensitivity: resp.instrumentSensitivity,
          stages: resp.stages
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
      return spjsNet.codes()+"_"+spjsNet.startDate.toISOString().substring(0,4);
    } else {
      return spjsNet.codes();
    }
  },
  createStationId: function(spjsStation) {
    return this.createNetworkId(spjsStation.network)
      +"."+spjsStation.stationCode
      +"_"+spjsStation.startDate.toISOString();
  },
  createChannelId: function(spjsChannel) {
    return this.createNetworkId(spjsChannel.station.network)
      +"."+spjsChannel.station.stationCode
      +"."+spjsChannel.locationCode
      +"."+spjsChannel.channelCode
      +"_"+spjsChannel.startDate.toISOString();
  },
  NET_STATIONS_URL: "seisplotjs:net.stationsURL",
  STA_NETWORK_URL: "seisplotjs:sta.networkURL",
  STA_CHANNELS_URL: "seisplotjs:sta.channelsURL",
  CHAN_STATION_URL: "seisplotjs:chan_stationURL",
  CHAN_RESPONSE_URL: "seisplotjs:chan_responseURL",
});
