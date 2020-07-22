import { helper } from '@ember/component/helper';

export default helper(function sddChannelCodes(sdd/*, hash*/) {
  console.log(`sddChannelCodes ${sdd.constructor.name}`)
  if (Array.isArray(sdd)) {
    return sdd.map(s => s.channel.codes()).join();
  }
  return sdd.channel.codes();
});
