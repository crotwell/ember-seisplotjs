import DS from 'ember-data';
import fdsnstationSerializer from '../serializers/fdsnstation';
import seisplotjs from 'ember-seisplotjs';

export default DS.Adapter.extend({
  defaultHost: 'http://service.iris.edu',
  defaultNamespace: 'fdsnws/station/1/query',
  defaultSerializer: 'fdsnstation',

  findRecord(store, type, id, snapshot) {
    const modelName = type.modelName;
    console.log("FDSNStation adapter findRecord modelName: "+modelName+" id: "+id);
    var protocol = this.findProtocol();
    let idDate = id.split("_")[1];
    let promise;
    let splitId = id.split(".");
    let stationQuery = new seisplotjs.fdsnstation.StationQuery()
      .protocol(protocol)
      .networkCode(splitId[0])
      .startTime(idDate);
    if (modelName === seisplotjs.fdsnstation.LEVEL_NETWORK) {
      promise = stationQuery.queryNetworks();
    } else if (modelName === seisplotjs.fdsnstation.LEVEL_STATION) {
      stationQuery.stationCode(splitId[1]);
      promise = stationQuery.queryStations();
    } else if (modelName === seisplotjs.fdsnstation.LEVEL_CHANEL) {
      stationQuery.stationCode(splitId[1])
        .locationCode(splitId[2])
        .channelCode(splitId[3]);
      promise = stationQuery.queryChannels();
    } else if (modelName === seisplotjs.fdsnstation.LEVEL_RESPONSE) {
      stationQuery.stationCode(splitId[1])
        .locationCode(splitId[2])
        .channelCode(splitId[3]);
      promise = stationQuery.queryResponse();
    } else {
      throw new Error("Unknown type: "+modelName);
    }

    return promise
      .then(netArray => {
        if (netArray.length > 0) {
          return netArray;
        } else {
          throw new Error("no network for id "+id+" found.");
        }
      });
  },
  query(store, type, query) {
    console.log("Station adapter query");
    throw new Error("No impl findMany");
  },
  findAll(store, type, sinceToken) {
    console.log("Station adapter findAll");
    throw new Error("No impl findMany");},
  findMany(store, type, ids, snapshots) {
    console.log("Station adapter findMany");
    throw new Error("No impl findMany");
  },
  createRecord(store, type, snapshot) {throw new Error("fdsnstation is read-only, create not allowed.");},
  deleteRecord(store, type, snapshot) {throw new Error("fdsnstation is read-only, delete not allowed.");},
  findHasMany(store, snapshot, link, relationship) {
    console.log("findHasMany: "+relationship.type+" "+relationship.kind+" "+link+" "+snapshot.id+" "+snapshot.modelName);
    if (snapshot.modelName === 'network' && relationship.type === 'station') {
      console.log('findHasMany: '+snapshot.record.get('networkCode'));
      let stationQuery = new seisplotjs.fdsnstation.StationQuery()
        .protocol(this.findProtocol())
        .networkCode(snapshot.record.get('networkCode'))
        .startTime(snapshot.record.get('startTime'));
        console.log("findHasMany url: "+stationQuery.formURL(seisplotjs.fdsnstation.LEVEL_STATION))
      return stationQuery.queryStations();
    } else {
      throw new Error("Unknown model and relationship: "+snapshot.modelName+" "+relationship.type+" "+link);
    }
  },
  /** checks for http or https */
  findProtocol() {
    var protocol = 'http:';
    if ("https:" == document.location.protocol) {
      protocol = 'https:'
    }
    return protocol;
  }
});
