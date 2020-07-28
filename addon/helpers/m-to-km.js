import { helper } from '@ember/component/helper';

export default helper(function mToKm([ m ]/*, hash*/) {
  return m / 1000;
});
