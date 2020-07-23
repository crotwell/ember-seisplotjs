import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | capitalize', function(hooks) {
  setupRenderingTest(hooks);

  test('cap the first letter', async function(assert) {
    this.set('inputValue', 'abc');

    await render(hbs`{{capitalize inputValue}}`);

    assert.equal(this.element.textContent.trim(), 'Abc');
  });
});
