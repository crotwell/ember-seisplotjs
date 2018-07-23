import Service from '@ember/service';
import seisplotjs from 'ember-seisplotjs';

console.log("in addon fdsndataselect");
export default Service.extend({

blaa() {
  console.log("bla");
},
  load(channel, startTime, endTime) {
    if ( ! endTime) {
      endTime = new Date();
    }
    if (typeof startTime === 'number') {
      if ( ! (endTime instanceof Date)) {
        throw new Error("can't calculate times for s="+startTime+" e="+endTime);
      }
      startTime = new Date(endTime.getTime()-startTime*1000);
    }
    if (typeof endTime === 'number') {
      if ( ! (startTime instanceof Date)) {
        throw new Error("can't calculate times for s="+startTime+" e="+endTime);
      }
      endTime = new Date(startTime.getTime()+endTime*1000);
    }
    const query = new seisplotjs.fdsndataselect.DataSelectQuery();
    query.networkCode(channel.get('networkCode'))
      .stationCode(channel.get('stationCode'))
      .locationCode(channel.get('locationCode'))
      .channelCode(channel.get('channelCode'))
      .startTime(startTime)
      .endTime(endTime);
    return query.query()
      .then(function(miniseed) {
        let byChannel = miniseed.byChannel(miniseed);
        let keys = Array.from(byChannel.keys());
        console.log("keys: "+keys);
        let seismograms = [];
        for(let i=0; i<keys.length; i++) {
          let key = keys[i];
          seismograms.push(seisplotjs.miniseed.merge(byChannel.get(key)));
        }
        return seismograms;
      });
  }
});
