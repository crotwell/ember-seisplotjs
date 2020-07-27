import { helper } from '@ember/component/helper';

export default helper(function asJson(params/*, hash*/) {
  if (typeof params[0] === 'undefined') return "";
  return JSON.stringify(params[0], null, 2);
});
