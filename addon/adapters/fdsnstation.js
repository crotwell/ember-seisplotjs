import JSONAPIAdapter from 'ember-data/adapters/json-api';
import fdsnstationSerializer from '../serializers/fdsnstation';
import seisplotjs from './lib';

export default JSONAPIAdapter.extend({
  defaultHost: 'http://service.iris.edu',
  defaultNamespace: 'fdsnws/station/1/query',
  defaultSerializer: 'fdsnstation',

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
    let urlStationQuery = new seisplotjs.fdsnstation.StationQuery()
      .protocol(protocol)
      .networkCode(splitId[0])
      .startTime(idDate);
    let urls = {};
    urls.networkUrl = urlStationQuery.formUrl(seisplotjs.fdsnstation.LEVEL_NETWORK)

    if (type === seisplotjs.fdsnstation.LEVEL_NETWORK) {
      promise = stationQuery.queryNetworks();
      urls.stationsUrl = urlStationQuery.formUrl(seisplotjs.fdsnstation.LEVEL_STATION);
    } else if (type === seisplotjs.fdsnstation.LEVEL_STATION) {
      stationQuery.stationCode(splitId[1]);
      urlStationQuery.stationCode(splitId[1]);
      urls.channelsUrl = urlStationQuery.formUrl(seisplotjs.fdsnstation.LEVEL_CHANNEL);
      promise = stationQuery.queryStations();
    } else if (type === seisplotjs.fdsnstation.LEVEL_CHANEL) {
      stationQuery.stationCode(splitId[1])
        .locationCode(splitId[2])
        .channelCode(splitId[3]);
      urlStationQuery.stationCode(splitId[1]);
      urls.stationUrl = urlStationQuery.formUrl(seisplotjs.fdsnstation.LEVEL_STATION);
      urlStationQuery.locationCode(splitId[2])
        .channelCode(splitId[3]);
      urls.responseUrl = urlStationQuery.formUrl(seisplotjs.fdsnstation.LEVEL_RESPONSE);
      promise = stationQuery.queryChannels();
    } else if (type === seisplotjs.fdsnstation.LEVEL_RESPONSE) {
      stationQuery.stationCode(splitId[1])
        .locationCode(splitId[2])
        .channelCode(splitId[3]);
      urlStationQuery.locationCode(splitId[2])
        .channelCode(splitId[3]);
      urls.channelUrl = urlStationQuery.formUrl(seisplotjs.fdsnstation.LEVEL_CHANEL);
      promise = stationQuery.queryResponse();
    } else {
      throw new Error("Unknown type: "+type);
    }

    let promise = stationQuery.query(type);
    return promise
      .then(netArray => {
        if (netArray.length > 0) {
          netArray[0].urls = urls;
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
