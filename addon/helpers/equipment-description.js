import { helper } from '@ember/component/helper';

export default helper(function equipmentDescription(params/*, hash*/) {
  let out = "";
  if (! params || params.length === 0) {return out;}
  let equipment = params[0];
  if ( typeof equipment === 'object') {
    if (equipment.description) {
      out = equipment.description
      .replace('Velocity Transducer', 'Seismometer')
      .replace('VELOCITY-TRANSDUCER', 'Seismometer')
      .replace('VELOCITY TRANSDUCER', 'Seismometer')
      .replace('TRANSDUCER', 'Sensor')
      .replace('Transducer', 'Sensor')
    }
    if (! out && equipment.model) {
      out = equipment.model;
    }
    if (! out && equipment.model) {
      out = equipment.model;
    }
    if (! out && equipment.manufacturer) {
      out = equipment.manufacturer;
    }
    if (! out && equipment.type) {
      out = equipment.type;
    }
  }
  return out;
});
