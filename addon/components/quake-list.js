import Component from '@glimmer/component';
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { sort } from '@ember/object/computed';

export default class QuakeListComponent extends Component {

    @tracked sortDefinition = ['preferredOrigin.time:desc'];

    @sort('args.quakes', 'sortDefinition') sortedQuakes;

    init() {
      this._super(...arguments);
      if (this.args.sortDefinition) {
        this.sortDefinition = this.args.sortDefinition;
      }
    }

    @action sortBy(key) {
      console.log(`QuakeStationsListComponent sortBy(${key})  `);
      let direction = "asc";
      if (this.sortDefinition[0].startsWith(key)) {
        if (this.sortDefinition[0].endsWith(":desc")) {
          direction = "asc";
        } else {
          direction = "desc";
        }
      } else {
        direction = "asc";
      }
      this.sortDefinition = [ key+":"+direction ];
    }
}
