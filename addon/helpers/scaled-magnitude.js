import { helper } from '@ember/component/helper';

export default helper(function scaledMagnitude([ quake ], {pixelsPerMag}) {
  let pxPer = pixelsPerMag || 5;
  pxPer = 1.0*pxPer;
  return quake.get('preferredMagnitude').get('mag') * pxPer;
});
