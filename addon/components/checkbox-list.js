import Component from '@glimmer/component';
import { A, isArray } from '@ember/array';
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";


class CheckboxItem {
  value = null;
  label = '';
  isSelected = false;
  constructor(value, label, selected) {
    this.value = value;
    this.label = label;
    this.isSelected = selected;
  }
}
export default class CheckboxListComponent extends Component {
  @tracked checkedItemsSet = new Set();
  constructor() {
    super(...arguments);
    this.args.selected.forEach(s => this.checkedItemsSet.add(s));
    console.log("IN INIT###########")
    console.log(`init  sel: ${Array.from(this.checkedItemsSet).join(',')}`)
  }
  @action check(item) {
    let checkedItemsSet = this.checkedItemsSet;
    console.log(`check ${item} l: ${item.label} before sel: ${Array.from(checkedItemsSet).join(',')}`)
    if (checkedItemsSet.has(item.label)) {
      checkedItemsSet.delete(item.label);
    } else {
      checkedItemsSet.add(item.label);
    }
    console.log(`check ${item}  after sel: ${Array.from(checkedItemsSet).join(',')}`)
    this.args.selectionChanged(A(Array.from(checkedItemsSet)));
  }

  get itemList() {
    return this.args.items.map( o => new CheckboxItem(o, o, this.args.selected.includes(o)));
  }
  isSelected(item) {
    return this.args.selected.includes(item.label);
  }
}
