import { helper } from '@ember/component/helper';

export default helper(function formatNumber(params/*, hash*/) {
  if ( typeof params[0] === 'undefined') { return "";}
  let decimalDigits = params[1]===undefined ? 2 : params[1];
  if ( typeof params[0] === 'number') { return  params[0].toFixed(decimalDigits);}
  // not number, so just return unmodified
  return params[0];
});
