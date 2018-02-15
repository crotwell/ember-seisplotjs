import DS from 'ember-data';
import fdsnstationSerializer from '../serializers/fdsnstation';
import seisplotjs from 'ember-seisplotjs';
import moment from 'moment';

export default DS.Adapter.extend({
  defaultHost: 'http://service.iris.edu',
  defaultNamespace: 'fdsnws/station/1/query',
  defaultSerializer: 'fdsnstation',

  findRecord(store, type, id, snapshot) {
    const modelName = type.modelName;
    console.log("FDSNStation adapter findRecord modelName: "+modelName+" id: "+id);
    var protocol = this.findProtocol();
    let codes_date = id.split("_");
    let idDateStr = codes_date[1];
    let promise;
    let splitId = codes_date[0].split(".");
    let stationQuery = new seisplotjs.fdsnstation.StationQuery()
      .protocol(protocol)
      .networkCode(splitId[0]);
    let idDate = null;
    if (idDateStr) {
      // network level for perm nets may not have date
      idDate = moment.utc(idDateStr);
      stationQuery.startTime(idDate);
    }
    if (modelName === seisplotjs.fdsnstation.LEVEL_NETWORK) {
      // don't set startsBefore on net or sta due to weird
      // dmc impl only using channels for start/end
      promise = stationQuery.queryNetworks();
    } else if (modelName === seisplotjs.fdsnstation.LEVEL_STATION) {
      // don't set startsBefore on net or sta due to weird
      // dmc impl only using channels for start/end
      stationQuery.stationCode(splitId[1]);
      promise = stationQuery.queryStations();
    } else if (modelName === seisplotjs.fdsnstation.LEVEL_CHANNEL) {
      stationQuery.stationCode(splitId[1])
        .locationCode(splitId[2])
        .channelCode(splitId[3]);
      if (idDate) {
        stationQuery.startBefore(idDate.add(1, 'second'));
      }
      promise = stationQuery.queryChannels();
    } else if (modelName === seisplotjs.fdsnstation.LEVEL_RESPONSE) {
      stationQuery.stationCode(splitId[1])
        .locationCode(splitId[2])
        .channelCode(splitId[3]);
      if (idDate) {
        stationQuery.startBefore(idDate.add(1, 'second'));
      }
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
    throw new Error("No impl query");
  },
  findAll(store, type, sinceToken) {
    console.log("Station adapter findAll");
    throw new Error("No impl findAll "+type.modelName);
  },
  // no impl findMany as not possible with current fdsn station ws

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
    } else if (snapshot.modelName === 'station' && relationship.type === 'channel') {
      console.log('findHasMany: '+snapshot.record.get('codes'));
      let stationQuery = new seisplotjs.fdsnstation.StationQuery()
        .protocol(this.findProtocol())
        .networkCode(snapshot.record.get('networkCode'))
        .stationCode(snapshot.record.get('stationCode'))
        .startTime(snapshot.record.get('startTime'));
        console.log("findHasMany url: "+stationQuery.formURL(seisplotjs.fdsnstation.LEVEL_CHANNEL))
      return stationQuery.queryChannels();
    } else {
      throw new Error("Unknown model and relationship: "+snapshot.modelName+" "+relationship.type+" "+link);
    }
  },
  /** checks for http or https */
  findProtocol() {
    var protocol = 'http:';
    if (document && "https:" == document.location.protocol) {
      protocol = 'https:'
    }
    return protocol;
  }
});
