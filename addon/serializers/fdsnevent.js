import JSONAPISerializer from '@ember-data/serializer/json-api';

import seisplotjs from 'seisplotjs';
import moment from 'moment';

export default class FdsnEventSerializer extends JSONAPISerializer {

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
  }
  normalize(modelClass, resourceHash) {
    console.log(`FDSNEventSerializer normalize ${modelClass.modelName}`);
    if (modelClass.modelName === "quake") {
      return this.normalizeQuake(resourceHash);
    } else if (modelClass.modelName === "origin") {
      return this.normalizeOrigin(resourceHash);
    } else if (modelClass.modelName === "pick") {
      return this.normalizePick(resourceHash);
    } else if (modelClass.modelName === "arrival") {
      return this.normalizeArrival(resourceHash);
    }
    throw new Error("fdsnevent serializer unknown type to normalize: "+resourceHash.id
      +" "+modelClass.modelName);
  }
  normalizeQuake(quake) {
    // console.log("normalizeQuake");
    let quakeId = this.createQuakeId(quake);
    const data = {
      id: quakeId,
      type: 'quake',
      attributes: {
          eventId: quake.eventId,
          publicId: quake.publicId,
          time: quake.time,
          latitude: quake.latitude,
          longitude: quake.longitude,
          depth: quake.depth,
          description: quake.description,
          preferredMagnitudeId: quake.preferredMagnitudeId,
          preferredOriginId: quake.preferredOriginId,
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
        const magNorm = this.normalizeMagnitude(quake.magnitude, quakeId);
        included.push(magNorm.data);

        data.relationships.preferredMagnitude = {
          data: {
            id: magNorm.data.id,
            type: magNorm.data.type,
            }
          };
    }
    if (quake.preferredOrigin) {
      let normOrigin = this.normalizeOrigin(quake.preferredOrigin);
      included.push(normOrigin.data);
      data.relationships.preferredOrigin = {
        data: {
          id: normOrigin.data.id,
          type: normOrigin.data.type,
          }
        };
      for(let i of normOrigin.included) {
        included.push(i);
      }
    } else {
      console.log("No pref origin");
    }
    if (quake.pickList) {
    // console.log(`quake has pickList ${quake.pickList.length}`);
      let pList = [];
      data.relationships.pickList = {
        data: pList,
      };
      for (let p of quake.pickList) {
        let normPick = this.normalizePick(p, quakeId);
        included.push(normPick.data);
        pList.push({
            id: normPick.data.id,
            type: normPick.data.type,
          });
        for(let i of normPick.included) {
          included.push(i);
        }
      }
    }
    let out = { data: data, included: included };
    //console.log("Quake as jsonapi: "+JSON.stringify(out, null, 2));
    return out;
  }
  normalizeOrigin(origin, quakeId) {
    const data = {
      id: this.createOriginId(origin),
      type: 'origin',
      attributes: {
        publicId: origin.publicId,
        time: origin.time,
        latitude: origin.latitude,
        longitude: origin.longitude,
        depth: origin.depth,
      },
      relationships: {
        quake: {
          data: {
            type: 'quake',
            id: quakeId,
          }
        }
      }
    };

    const included = [];
    if (origin.arrivalList) {
      // console.log(`fdsnevent serializer spjsOrigin has arrivals ${origin.arrivalList.length}`);
      let aList = [];
      data.relationships.arrivalList = {
        data: aList
      };
      for (let a of origin.arrivalList) {
        let normArrival = this.normalizeArrival(a, data.id);
        included.push(normArrival.data);
        aList.push({
            id: normArrival.data.id,
            type: normArrival.data.type,
          });
        for(let i of normArrival.included) {
          included.push(i);
        }
      }
    } else {
      console.log("fdsnevent serializer spjsOrigin has no arrivalList");
    }
    const out = { data: data, included: included };
    return out;
  }
  normalizeMagnitude(mag, quakeId) {
    const data = {
      id: this.createMagnitudeId(mag),
      type: 'magnitude',
      attributes: {
        mag: mag.mag,
        magType: mag.type,
      },
      relationships: {
        quake: {
          data: {
            type: 'quake',
            id: quakeId,
          }
        }
      }
    };
    const included = [];
    const out = { data: data, included: included };
    return out;
  }
  normalizeArrival(arrival, originId) {
    const data = {
      id: this.createArrivalId(arrival),
      type: 'arrival',
      attributes: {
        phase: arrival.phase,
        publicId: arrival.publicId,
      },
      relationships: {
        origin: {
          data: {
            type: 'origin',
            id: originId,
          }
        },
      }
    };
    const included = [];
    if (arrival.pick) {
      let pickNorm = this.normalizePick(arrival.pick, data.id);
      included.push(pickNorm.data);
      data.relationships.pick = {
        data: {
          id: pickNorm.data.id,
          type: pickNorm.data.type,
          }
        };
    }
    const out = { data: data, included: included };
    return out;
  }
  normalizePick(pick, quakeId) {
    const data = {
      id: this.createPickId(pick),
      type: 'pick',
      attributes: {
        time: pick.time,
        networkCode: pick.networkCode,
        stationCode: pick.stationCode,
        locationCode: pick.locationCode,
        channelCode: pick.channelCode,
        publicId: pick.publicId,
      },
      relationships: {
        quake: {
          data: {
            type: 'quake',
            id: quakeId,
          }
        }
      }
    };
    const included = [];
    const out = { data: data, included: included };
    return out;
  }
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
  createQuakeId(spjsQuake) {
    return spjsQuake.eventId;
  }
  createOriginId(spjsOrigin) {
    return spjsOrigin.publicId;
  }
  createMagnitudeId(spjsMag) {
    return spjsMag.publicId;
  }
  createArrivalId(spjsArrival) {
    return spjsArrival.publicId;
  }
  createPickId(spjsPick) {
    return spjsPick.publicId;
  }
  QUAKE_MAG_URL = "seisplotjs:quake.magURL";
  QUAKE_PICK_URL = "seisplotjs:quake.pickURL";
  QUAKE_ARRIVAL_URL = "seisplotjs:quake.arrivalURL";
}
