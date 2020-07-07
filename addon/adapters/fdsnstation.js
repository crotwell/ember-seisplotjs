import Adapter from '@ember-data/adapter';
import fdsnstationSerializer from '../serializers/fdsnstation';
import seisplotjs from 'seisplotjs';
import moment from 'moment';

export default class FdsnstationAdapter extends Adapter {
  defaultHost = 'http://service.iris.edu';
  defaultNamespace =  'fdsnws/station/1/query';


  findRecord(store, type, id, snapshot) {
    const modelName = type.modelName;
    console.log("FDSNStation adapter findRecord modelName: "+modelName+" id: "+id);
    let protocol = this.findProtocol();
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
  }
  query(store, type, query) {
    console.log(`Station adapter query ${type.modelName}`);
    if (type.modelName === 'network' ||
        type.modelName === 'station' ||
        type.modelName === 'channel' ||
        type.modelName === 'response' ) {
      let protocol = this.findProtocol();
      let staQuery = new seisplotjs.fdsnstation.StationQuery()
        .protocol(protocol);
      if (query.specVersion) { staQuery.specVersion(query.specVersion);}
      if (query.protocol) { staQuery.protocol(query.protocol);}
      if (query.host) { staQuery.host(query.host);}
      if (query.nodata) { staQuery.nodata(query.nodata);}

      if (query.networkCode) { staQuery.networkCode(query.networkCode);}
      if (query.stationCode) { staQuery.stationCode(query.stationCode);}
      if (query.locationCode) { staQuery.locationCode(query.locationCode);}
      if (query.channelCode) { staQuery.channelCode(query.channelCode);}
      if (query.startTime) { staQuery.startTime(query.startTime);}
      if (query.endTime) { staQuery.endTime(query.endTime);}
      if (query.startBefore) { staQuery.startBefore(query.startBefore);}
      if (query.endBefore) { staQuery.endBefore(query.endBefore);}
      if (query.startAfter) { staQuery.startAfter(query.startAfter);}
      if (query.endAfter) { staQuery.endAfter(query.endAfter);}
      if (query.minLat) { staQuery.minLat(query.minLat);}
      if (query.maxLat) { staQuery.maxLat(query.maxLat);}
      if (query.minLon) { staQuery.minLon(query.minLon);}
      if (query.maxLon) { staQuery.maxLon(query.maxLon);}
      if (query.latitude) { staQuery.latitude(query.latitude);}
      if (query.longitude) { staQuery.longitude(query.longitude);}
      if (query.minRadius) { staQuery.minRadius(query.minRadius);}
      if (query.maxRadius) { staQuery.maxRadius(query.maxRadius);}
      if (query.includeRestricted) { staQuery.includeRestricted(query.includeRestricted);}
      if (query.includeAvailability) { staQuery.includeAvailability(query.includeAvailability);}
      if (query.format) { staQuery.format(query.format);}
      if (query.updatedAfter) { staQuery.updatedAfter(query.updatedAfter);}
      if (query.matchTimeseries) { staQuery.matchTimeseries(query.matchTimeseries);}

      if ( ! staQuery.isSomeParameterSet()) {
        console.log(` query: ${staQuery.formURL(type.modelName)}`)
        throw new Error("FDSN Station Query but no parameters set, this results in a too large response.");
      }
      if (type.modelName === 'network' ) {
        return staQuery.queryNetworks();
      } else if (type.modelName === 'station' ) {
        return staQuery.queryStations();
      } else if (type.modelName === 'channel' ) {
        return staQuery.queryChannels();
      } else if (type.modelName === 'response' ) {
        return staQuery.queryResponse();
      } else {
        throw new Error(`Unrecognized modelName: ${type.modelName}`);
      }
    } else {
      console.log("Station adapter query");
      throw new Error(`No impl query ${type.modelName}`);
    }
  }
  findAll(store, type, sinceToken) {
    console.log("Station adapter findAll");
    throw new Error("No impl findAll "+type.modelName);
  }
  // no impl findMany as not possible with current fdsn station ws

  createRecord(store, type, snapshot) {throw new Error("fdsnstation is read-only, create not allowed.");}
  deleteRecord(store, type, snapshot) {throw new Error("fdsnstation is read-only, delete not allowed.");}
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
  }
  /** checks for http or https */
  findProtocol() {
    var protocol = 'http:';
    if (document && "https:" == document.location.protocol) {
      protocol = 'https:'
    }
    return protocol;
  }
}
