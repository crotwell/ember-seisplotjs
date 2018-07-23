import EmberObject from '@ember/object';
import seisplotjs from 'ember-seisplotjs';
import moment from 'moment';

export default EmberObject.extend({
  init() {},

  load(channel, startTime, endTime) {
  console.log("in fdsndataselect util load: "+channel);
    if ( ! endTime) {
      endTime = moment.utc();
    }
    if (typeof startTime === 'number') {
      if ( ! (endTime instanceof moment)) {
        throw new Error("can't calculate times for s="+startTime+" e="+endTime);
      }
      startTime = moment.utc(endTime).subtract(startTime, 'seconds');
    }
    if (typeof endTime === 'number') {
      if ( ! (startTime instanceof moment)) {
        throw new Error("can't calculate times for s="+startTime+" e="+endTime);
      }
      endTime = moment.utc(startTime).add(endTime, 'seconds');
    }
    const query = new seisplotjs.fdsndataselect.DataSelectQuery();
    query.networkCode(channel.get('networkCode'))
      .stationCode(channel.get('stationCode'))
      .locationCode(channel.get('locationCode'))
      .channelCode(channel.get('channelCode'))
      .startTime(startTime)
      .endTime(endTime);
    return query.query();
  /*
      .then(function(miniseed) {
        console.log("miniseed: "+miniseed);
        let byChannel = seisplotjs.miniseed.byChannel(Array.from(miniseed));
        let keys = Array.from(byChannel.keys());
        console.log("keys: "+keys);
        let seismograms = [];
        for(let i=0; i<keys.length; i++) {
          let key = keys[i];
          console.log("key: "+key+" "+byChannel.get(key));
          seismograms.push(seisplotjs.miniseed.merge(byChannel.get(key)));
        }
        return seismograms;
      });
      */
  }
});
