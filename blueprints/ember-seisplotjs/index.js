
/* eslint-env node */
module.exports = {
  description: 'add seisplotjs npm package',

  // locals: function(options) {
  //   // Return custom template variables here.
  //   return {
  //     foo: options.entity.options.foo
  //   };
  // }

  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },

  afterInstall: function() {
    return this.addAddonsToProject({
      // a packages array defines the addons to install
      packages: [
         // name is the addon name, and target (optional) is the version
         {name: '@ember/render-modifiers'},
         {name: 'ember-moment'}
      ]
    }).then(() => {
      return this.addPackagesToProject([
          {name: 'seisplotjs', target:'^2.0.1'}
      ]);
    });
  }
};
