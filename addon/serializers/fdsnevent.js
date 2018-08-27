import DS from 'ember-data';

import seisplotjs from 'ember-seisplotjs';
import moment from 'moment';

export default DS.JSONAPISerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    console.log(`FDSNEventSerializer normalizeResponse ${requestType} ${primaryModelClass.modelName}`);
    if (requestType === 'findRecord') {
      return this.normalize(primaryModelClass, payload);
    } else if (requestType === 'findHasMany') {
      if (primaryModelClass.modelName === 'XXXXXXquake') {
        let q = payload[0];
        let out = [];
        for (const st of net.stations()) {
          const normSta = this.normalizeStation(st);
          out.push(normSta.data);
        }
        let included = [ this.normalizeNetwork(net).data ];
        return { data: out, included: included };
      } else {
        throw new Error("unknown modelName for normalizeResponse findHasMany "+primaryModelClass.modelName);
      }
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
    console.log(`FDSNEventSerializer normalize ${modelClass.modelName}`);
    if (modelClass.modelName === "quake") {
      return this.normalizeQuake(resourceHash);
    } else if (modelClass.modelName === "station") {
      if ( ! net.stations() || net.stations().length != 1) {
        throw new Error("unable to normalize station, not single station: "+net.stations().length);
      }
      let out = this.normalizeStation(net.stations()[0]);
      out.included.push(this.normalizeNetwork(net).data);
      return out;
    } else if (modelClass.modelName === "channel") {
      if ( ! net.stations() || net.stations().length != 1) {
        throw new Error("unable to normalize channel, not single station: "+net.stations().length);
      }
      let sta = net.stations()[0];
      if ( ! sta || sta.channels().length != 1) {
        throw new Error("unable to normalize channel, not single channel: "+sta.channels().length);
      }
      let out = this.normalizeChannel(sta.channels()[0]);
      out.included.push(this.normalizeNetwork(net).data);
      out.included.push(this.normalizeStation(sta).data);
      return out;
    } else if (modelClass.modelName === "response") {
      if ( ! net.stations() || net.stations().length != 1) {
        throw new Error("unable to normalize channel, not single station: "+net.stations());
      }
      let sta = net.stations()[0];
      if ( ! sta || sta.channels().length != 1) {
        throw new Error("resp unable to normalize channel, not single channel: "+sta.channels().length);
      }
      let out = this.normalizeChannelResponse(sta.channels()[0].response(), sta.channels()[0].createId());
      out.included.push(this.normalizeNetwork(net).data);
      out.included.push(this.normalizeStation(sta).data);
      out.included.push(this.normalizeChannel(sta.channels()[0]).data);
      return out;
    }
    throw new Error("fdsnstation serializer unknown type to normalize: "+resourceHash.id
      +" "+modelClass.modelName);
  },
  normalizeQuake(quake) {
    const data = {
      id: this.createQuakeId(quake),
      type: 'quake',
      attributes: {
          eventid: quake.eventid,
          publicID: quake.publicID,
          time: quake.time,
          latitude: quake.latitude,
          longitude: quake.longitude,
          depth: quake.depth,
          description: quake.description,
          preferredMagnitudeID: quake.preferredMagnitudeID,
      },
      relationships: {
        magnitudes: {
          links: {
            related: this.QUAKE_MAG_URL
          }
        },
      }
    };
    const included = [];
    if (quake.magnitude) {
        const magNorm = this.normalizeMagnitude(quake.magnitude, quake).data;
        included.push(magNorm);

        data.relationships.prefMagnitude = {
          data: {
            id: magNorm.id,
            type: magNorm.type,
            }
          };
    }
    let out = { data: data, included: included };
    console.log(`norm quake jsonapi: ${JSON.stringify(out, null, "  ")}`);
    return out;
  },
  normalizeMagnitude(mag, quake) {
    const data = {
      id: this.createMagnitudeId(mag),
      type: 'magnitude',
      attributes: {
        mag: mag.mag,
        type: mag.type,
      },
      relationships: {
        quake: {
          data: {
            type: 'quake',
            id: quake.id,
          }
        }
      }
    };
    const included = [];
    const out = { data: data, included: included };
    return out;
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
  createQuakeId: function(spjsQuake) {
    return spjsQuake.eventid;
  },
  createOriginId: function(spjsStation) {
    return this.createNetworkId(spjsStation.network())
      +"."+spjsStation.stationCode()
      +"_"+spjsStation.startDate().toISOString();
  },
  createMagnitudeId: function(spjsMag) {
  console.log(`createMagnitudeId ${spjsMag} ${spjsMag.publicID}`);
    return spjsMag.publicID;
  },
  QUAKE_MAG_URL: "seisplotjs:quake.magURL",
  QUAKE_PICK_URL: "seisplotjs:quake.pickURL",
  QUAKE_ARRIVAL_URL: "seisplotjs:quake.arrivalURL",
});
