
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
    return this.addPackagesToProject([
      {name: 'seisplotjs', version:'^2.0.1'},
      {name: '@ember/render-modifiers'}
    ]);
  }
};
