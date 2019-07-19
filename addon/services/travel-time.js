import Service from '@ember/service';
import findProtocol from '../utils/find-protocol';
import seisplotjs from 'ember-seisplotjs';
import RSVP from 'rsvp';

export default Service.extend({
  init() {
    this._super(...arguments);
    console.log("travel time service init");
  },

  load(quake, station, phaseList) {
    if ( ! quake || ! station) {
      throw new Error(`Both quake and station required q=${quake} s=${station}`);
    }
    if (! phaseList || phaseList.length === 0) {
      phaseList = [ 'p', 'P', 's', 'S', 'PKP', 'PKP', 'PKIKP', 'SKS'];
    }
    let distaz = seisplotjs.distaz(station.latitude, station.longitude,
                                   quake.latitude, quake.longitude, quake.depth);
    const query = new seisplotjs.traveltime.TraveltimeQuery();
    query.protocol(findProtocol())
      .evdepth(quake.depth)
      .distdeg(distaz.delta)
      .phases(phaseList.join(','));
    let promise = query.queryJson();
    return RSVP.hash({
      traveltime: promise,
      distdeg: distaz.delta,
      phaseList: phaseList,
      quake: quake,
      station: station
    });
  }
});
