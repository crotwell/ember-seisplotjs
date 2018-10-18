import Service from '@ember/service';
import findProtocol from '../utils/find-protocol';
import seisplotjs from 'ember-seisplotjs';
const moment = seisplotjs.moment;

export default Service.extend({
  init() {
    console.log("travel time service init");
  },

  load(quake, station, phaseList) {
    if ( ! quake || ! station) {
      throw new Error(`Both quake and station required q=${quake} s=${station}`);
    }
    if (! phaseList || phaseList.length === 0) {
      phaseList = [ 'P', 'S'];
    }
    let distaz = seisplotjs.distaz(station.latitude, station.longitude,
                                   quake.latitude, quake.longitude, quake.depth);
    const query = new seisplotjs.traveltime.TraveltimeQuery();
    query.protocol(findProtocol())
      .evdepth(uake.depth)
      .distdeg(distaz.delta)
      .phases(phaseList.join(','));
    return query.queryJson();
  }
});
