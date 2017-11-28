import DS from 'ember-data';
import RSVP from 'rsvp';
import seisplotjs from 'ember-seisplotjs'
import moment from 'moment';

export const IRIS_RTSERVE = 'rtserve.iris.washington.edu';
export const IRIS_RTSERVE_PORT = 80;
export const EEYORE_RINGSERVER = 'eeyore.seis.sc.edu';
export const EEYORE_PORT = 6382;
export const DEFAULT_HOST = EEYORE_RINGSERVER;
export const DEFAULT_PORT = EEYORE_PORT;

export default DS.JSONAPIAdapter.extend({
  defaultSerializer: 'stream-status',
  findRecord(store, type, id, snapshot) {
    throw new Error("No impl findRecord");
  },
  query(store, type, query) {
    console.log("StreamStatus adapter query");
    let host = DEFAULT_HOST;
    let port = DEFAULT_PORT;
    let match = null;
    if (query.host) { host = query.host;}
    if (query.port) { port = query.port;}
    if (query.match) { match = query.match;}

    let conn = new seisplotjs.seedlink.RingserverConnection(host, port);
    console.log("before pullId url="+conn.formIdURL());

    return conn.pullId().then(rsid => {
        console.log('Bconn ringserverVersion: '+rsid.ringserverVersion+" serverId: "+rsid.serverId);
        rsid.host = host;
        rsid.port = port;
        rsid.match = match;
        return rsid;
      }).then(rsid => {
        return conn.pullStreams(match).then(hash => {
          rsid.accessTime = hash.accessTime.toISOString();
          let staStreams = seisplotjs.seedlink.stationsFromStreams(hash.streams);
          let out = [];
          for (let ll of staStreams) {
            ll.rsid = rsid;
            out.push(ll);
          }
          return out;
        });
      });
  },
  findAll(store, type, sinceToken) {
    console.log("StreamStatus adapter findAll");
    throw new Error("No impl findAll");
  },
  findMany(store, type, ids, snapshots) {
    console.log("StreamStatus adapter findMany");
    throw new Error("No impl findMany");
  },
  createRecord(store, type, snapshot) {
    throw new Error("StreamStatus is read-only, create not allowed.");
  },
  deleteRecord(store, type, snapshot) {
    throw new Error("StreamStatus is read-only, delete not allowed.");
  },
  findHasMany(store, snapshot, link, relationship) {
    throw new Error("No impl findHasMany");
  }
});
