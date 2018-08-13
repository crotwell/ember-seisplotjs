import DS from 'ember-data';
import fdsneventSerializer from '../serializers/fdsnevent';
import seisplotjs from 'ember-seisplotjs';
import moment from 'moment';

export default DS.Adapter.extend({
  defaultHost: 'http://service.iris.edu',
  defaultNamespace: 'fdsnws/event/1/query',
  defaultSerializer: 'fdsnevent',

  findRecord(store, type, id, snapshot) {
    const modelName = type.modelName;
    if (type.modelName != "quake") {
      throw new Error("can only do quake");
    }
    console.log("FDSNEvent adapter findRecord modelName: "+modelName+" id: "+id);
    let protocol = this.findProtocol();
    let query = new seisplotjs.fdsnevent.EventQuery()
      .protocol(protocol)
      .eventid(id);
    return query.query().then(quakeArray => {
      if (quakeArray.length == 1) {
        return quakeArray[0];
      } else {
        throw new Error(`Query for eventid=${id} returned no quake.`);
      }
    });
  },
  query(store, type, query) {
    console.log(`quake adapter query ${type.modelName}`);

    if (type.modelName != "quake") {
      throw new Error("can only do quake");
    }
    let protocol = this.findProtocol();
    let eventQuery = new seisplotjs.fdsnevent.EventQuery()
      .protocol(protocol);
    if (query.specVersion) { eventQuery.specVersion(query.specVersion);}
    if (query.protocol) { eventQuery.protocol(query.protocol);}
    if (query.host) { eventQuery.host(query.host);}
    if (query.nodata) { eventQuery.nodata(query.nodata);}

    if (query.eventid) { eventQuery.eventid(query.eventid);}
    if (query.startTime) { eventQuery.startTime(query.startTime);}
    if (query.endTime) { eventQuery.endTime(query.endTime);}
    if (query.updatedAfter) { eventQuery.updatedAfter(query.updatedAfter);}

    if (query.minMag) { eventQuery.minMag(query.minMag);}
    if (query.maxMag) { eventQuery.maxMag(query.maxMag);}
    if (query.magnitudeType) { eventQuery.magnitudeType(query.magnitudeType);}
    if (query.minDepth) { eventQuery.minDepth(query.minDepth);}

    if (query.maxDepth) { eventQuery.maxDepth(query.maxDepth);}
    if (query.minLat) { eventQuery.minLat(query.minLat);}
    if (query.maxLat) { eventQuery.maxLat(query.maxLat);}
    if (query.minLon) { eventQuery.minLon(query.minLon);}
    if (query.maxLon) { eventQuery.maxLon(query.maxLon);}
    if (query.latitude) { eventQuery.latitude(query.latitude);}
    if (query.longitude) { eventQuery.longitude(query.longitude);}
    if (query.minRadius) { eventQuery.minRadius(query.minRadius);}
    if (query.maxRadius) { eventQuery.maxRadius(query.maxRadius);}
    if (query.includeArrivals) { eventQuery.includeArrivals(query.includeArrivals);}
    if (query.includeAllOrigins) { eventQuery.includeAllOrigins(query.includeAllOrigins);}
    if (query.includeAllMagnitudes) { eventQuery.includeAllMagnitudes(query.includeAllMagnitudes);}
    if (query.format) { eventQuery.format(query.format);}
    if (query.limit) { eventQuery.limit(query.limit);}
    if (query.offset) { eventQuery.offset(query.offset);}
    if (query.orderBy) { eventQuery.orderBy(query.orderBy);}
    if (query.catalog) { eventQuery.catalog(query.catalog);}
    if (query.contributor) { eventQuery.contributor(query.contributor);}
    if ( ! eventQuery.isSomeParameterSet()) {
      console.log(` query: ${eventQuery.formURL(type.modelName)}`)
      throw new Error("FDSN Event Query but no parameters set, this results in a too large response.");
    }
    return eventQuery.query();
  },
  findAll(store, type, sinceToken) {
    console.log("quake adapter findAll");
    throw new Error("No impl findAll "+type.modelName);
  },
  // no impl findMany as not possible with current fdsn station ws

  createRecord(store, type, snapshot) {throw new Error("fdsnstation is read-only, create not allowed.");},
  deleteRecord(store, type, snapshot) {throw new Error("fdsnstation is read-only, delete not allowed.");},
  findHasMany(store, snapshot, link, relationship) {
    console.log("findHasMany: "+relationship.type+" "+relationship.kind+" "+link+" "+snapshot.id+" "+snapshot.modelName);
    throw new Error("No impl findHasMany ");
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
