import Service from '@ember/service';
import seisplotjs from 'ember-seisplotjs';

const moment = seisplotjs.moment;

/** Loads Seismograms from an FDSN DataSelect web service.
* The returned miniseed DataRecords are converted into
* Seismograms and merged by channel. */
export default Service.extend({
  init() {

  },
  load(channel, startTime, endTime) {
    if ( ! endTime) {
      endTime = moment.utc();
    }
    if (typeof startTime === 'number') {
      if ( ! (moment.isMoment(endTime))) {
        throw new Error("can't calculate times for s="+startTime+" e="+endTime+", endTme not moment "+endTime.constructor.name);
      }
      startTime = moment.utc(endTime).subtract(startTime, 'seconds');
    }
    if (typeof endTime === 'number') {
      if ( ! (moment.isMoment(startTime))) {
        throw new Error("can't calculate times for s="+startTime+" e="+endTime+", startTme not moment");
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
    return query.querySeismograms();
  }
});
