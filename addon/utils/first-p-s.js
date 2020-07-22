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
      });
    let sArrival = traveltimes.traveltime.arrivals.reduce( (acc, cur) => {
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
    });
    return {
      "firstP": pArrival,
      "firstS": sArrival
    };
}
