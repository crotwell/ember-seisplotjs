import { helper } from '@ember/component/helper';

export default helper(function capitalize(params/*, hash*/) {
  return params[0].substring(0,1).toUpperCase()+params[0].substring(1);
});
