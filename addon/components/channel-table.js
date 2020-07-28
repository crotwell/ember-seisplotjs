import Component from '@glimmer/component';
import { A } from '@ember/array';
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { sort } from '@ember/object/computed';

export default class ChannelTableComponent extends Component {

  //@tracked sortDefinition = A(['starttime:desc', 'channelCode:asc', 'locationCode:asc' ]);
  @tracked sortDefinition = A(['startTime:desc' ]);

  @sort('args.channels', 'sortDefinition') sortedChannels;

  init() {
    this._super(...arguments);
    if (this.args.sortDefinition) {
      this.sortDefinition = this.args.sortDefinition;
    }
  }

  sortDefNumber = 0;

  @action sortBy(key) {
    console.log(`channel-table sortBy: ${key}`)
    let direction = "asc";
    if (this.sortDefinition[this.sortDefNumber].startsWith(key)) {
      if (this.sortDefinition[this.sortDefNumber].endsWith(":desc")) {
        direction = "asc";
      } else {
        direction = "desc";
      }
    } else {
      direction = "asc";
    }
    this.sortDefinition =  A([key+":"+direction]) ;
  }
}
