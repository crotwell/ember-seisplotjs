import seisplotjs from 'seisplotjs';

export function convertToSeisplotjs(network, station, channel) {
  if (channel) {
    return convertChannelToSPJS(channel, convertStationToSPJS(station, convertNetworkToSPJS(network)));
  } else if (station) {
    const net = convertNetworkToSPJS(network);
    const sta = convertStationToSPJS(station, net);
    sta.channels = station.channels.map(c => convertChannelToSPJS(c, sta));
  } else {
    const net = convertNetworkToSPJS(network);
    net.stations = network.stations.map(s => {
      const sta = convertStationToSPJS(s, net);
      sta.channels = s.channels.map(c => convertChannelToSPJS(c, sta));
    });
  }
}

function convertChannelToSPJS(channel, convertedStation) {
  const out = new seisplotjs.stationxml.Channel(convertedStation, channel.get('channelCode'), channel.get('locationCode'));
  out.startDate = channel.get('startTime');
  if ('endTime' in channel && channel.get('endTime')) {
    out.endDate = channel.get('endTime');
  }
  out.restrictedStatus = "";
  out.latitude = channel.get('latitude');
  out.longitude = channel.get('longitude');
  out.elevation = channel.get('elevation');
  out.depth = channel.get('depth');
  out.azimuth = channel.get('azimuth');
  out.dip = channel.get('dip');
  out.sampleRate = channel.get('sampleRate');
  out.elevation = channel.get('elevation');
  out.response = null;
  return out;
}

function convertStationToSPJS(station, convertedNetwork) {
  const out = new seisplotjs.stationxml.Station(convertedNetwork, station.get('stationCode'));
  out.startDate = station.get('startTime');
  if ('endTime' in station && station.get('endTime')) {
    out.endDate = station.get('endTime');
  }
  out.restrictedStatus = "";
  out.name = station.get('name');
  out.latitude = station.get('latitude');
  out.longitude = station.get('longitude');
  out.elevation = station.get('elevation');
  return out;
}

function convertNetworkToSPJS(network) {
  const out = new seisplotjs.stationxml.Network();
  out.networkCode = network.get('networkCode');
  out.startDate = network.get('startTime');
  if ('endTime' in network && network.get('endTime')) {
    out.endDate = network.get('endTime');
  }
  out.description = network.get('description');
  return out;
}

export function convertQuakeToSPjS(quake) {
  const out = new seisplotjs.quakeml.Quake();
  out.eventId = quake.eventId;
  out.publicId = quake.publicId;
  out.time = quake.time;
  out.latitude = quake.latitude;
  out.longitude = quake.longitude;
  out.depth = quake.depth;
  out.description = quake.description;
  out.preferredMagnitude = convertMagnitudeToSPJS(quake.preferredMagnitude);
  out.preferredMagnitudeID = quake.preferredMagnitudeID;
  out.preferredOrigin = convertOriginToSPJS(quake.preferredOrigin);
  out.magnitudeList = quake.magnitudeList.map( convertMagnitudeToSPJS );
  out.originList = quake.originList.map( convertOriginToSPJS );
  out.arrivalList = quake.arrivalList.map( convertArrivalToSPJS );
  out.pickList = quake.pickList.map( convertPickToSPJS );
  return out;
}

export function convertMagnitudeToSPJS(mag) {
  const out = new seisplotjs.quakeml.Magnitude(mag.get('mag'), mag.get('magType'));
  out.publicId = mag.publicId;
  return out;
}

export function convertOriginToSPJS(origin) {
  console.log(`convertOriginToSPJS: ${origin.get('time').toISOString()}`)
  const out = new seisplotjs.quakeml.Origin();
  out.time = origin.get('time');
  out.latitude = origin.get('latitude');
  out.longitude = origin.get('longitude');
  out.depth = origin.get('depth');
  out.publicId = origin.get('publicId');
  return out;
}

export function convertArrivalToSPJS(arrival) {
  const pick = convertPickToSPJS(arrival.get('pick'));
  const out = new seisplotjs.quakeml.Arrival(arrival.get('phase'), pick);
  out.publicId = arrival.get('publicId');
}

export function convertPickToSPJS(pick) {
  console.log(`convertPickToSPJS: ${pick.get('time')} ${pick.get('stationCode')} ${pick.get('publicId')}`);
  const out = new seisplotjs.quakeml.Pick(pick.get('time'),
                                          pick.get('networkCode'),
                                          pick.get('stationCode'),
                                          pick.get('locationCode'),
                                          pick.get('channelCode'));
  out.publicId = pick.get('publicId');
  return out;
}
