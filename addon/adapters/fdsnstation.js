import JSONAPIAdapter from 'ember-data/adapters/json-api';
import seisplotjs from './lib';

export default JSONAPIAdapter.extend({
  defaultHost: 'http://service.iris.edu',
  defaultNamespace: 'fdsnws/station/1/query',

  findRecord(store, type, id, snapshot) {
    console.log("FDSNStation adapter findRecord type: "+type+" id: "+id);
    var protocol = 'http:';
    if ("https:" == document.location.protocol) {
      protocol = 'https:'
    }
    let idDate = id.split("_")[1];

    let splitId = id.split(".");
    let stationQuery = new seisplotjs.fdsnstation.StationQuery()
      .protocol(protocol)
      .networkCode(splitId[0])
      .startTime(idDate);
    if (type === seisplotjs.fdsnstation.LEVEL_NETWORK) {
      promise = stationQuery.queryNetworks();
    } else if (type === seisplotjs.fdsnstation.LEVEL_STATION) {
      stationQuery.stationCode(splitId[1]);
      promise = stationQuery.queryStations();
    } else if (type === seisplotjs.fdsnstation.LEVEL_CHANEL) {
      stationQuery.stationCode(splitId[1])
        .locationCode(splitId[2])
        .channelCode(splitId[3]);
        promise = stationQuery.queryChannels();
    } else if (type === seisplotjs.fdsnstation.LEVEL_RESPONSE) {
      stationQuery.stationCode(splitId[1])
        .locationCode(splitId[2])
        .channelCode(splitId[3]);
        promise = stationQuery.queryResponse();
    } else {
      throw new Error("Unknown type: "+type);
    }

    let promise = stationQuery.query(type);
    return promise
      .then(netArray => {
        if (netArray.length > 0) {
          return netArray;
        } else {
          throw new Error("no network for id "+id+" found.");
        }
      });
  },
  query(store, type, query) {},
  findAll(store, type, sinceToken) {},
  findMany(store, type, ids, snapshots) {
    console.log("Station adabpter find Many");
    throw new Error("No impl findMany");
  },
  createRecord(store, type, snapshot) {throw new Error("fdsnstation is read-only, create not allowed.");},
  deleteRecord(store, type, snapshot) {throw new Error("fdsnstation is read-only, delete not allowed.");},
});
