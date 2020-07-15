import seisplotjs from 'seisplotjs';

export default function convertToSeisplotjs(network, station, channel) {
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
  console.log(`${(typeof channel)}  ${channel.constructor.name} `);
  const out = new seisplotjs.stationxml.Channel(convertedStation, channel.get('channelCode'), channel.get('locationCode'));
  console.log(`before startDate`);
  out.startDate = channel.get('startTime');
  console.log(`after startDate ${channel.get('startTime')}`);
  if ('endTime' in channel && channel.get('endTime')) {
    out.endDate = channel.get('endTime');
  }
  console.log(`after endDate ${channel.get('endTime')}`);
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
  if ('endTime' in station) {
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
  if ('endTime' in network) {
    out.endDate = network.get('endTime');
  }
  out.description = network.get('description');
  return out;
}
