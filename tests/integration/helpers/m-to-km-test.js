import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | m-to-km', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('inputValue', '12345');

    await render(hbs`{{m-to-km inputValue}}`);

    assert.equal(this.element.textContent.trim(), '12.345');
  });
});
