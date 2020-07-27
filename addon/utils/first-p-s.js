export default function firstPS(traveltimes) {
  let pArrival = traveltimes.traveltime.arrivals.reduce( (acc, cur) => {
        if (cur.phase.startsWith('P') || cur.phase.startsWith('p')) {
          if ( ! acc) {
            return cur;
          } else if (cur.time < acc.time) {
            return cur;
          } else {
            return acc;
          }
        }
        return acc;
      }, null);
  let sArrival = traveltimes.traveltime.arrivals.reduce( (acc, cur) => {
    if (cur.phase.startsWith('S') || cur.phase.startsWith('s')) {
      if ( ! acc) {
        return cur;
      } else if (cur.time < acc.time) {
        return cur;
      } else {
        return acc;
      }
    }
    return acc;
  }, null);
  return {
    "firstP": pArrival,
    "firstS": sArrival
  };
}
