
/* eslint-env node */
module.exports = {
  description: '',

  // ??? really needed???
  normalizeEntityName: function() {},

  // locals(options) {
  //   // Return custom template variables here.
  //   return {
  //     foo: options.entity.options.foo
  //   };
  // }

   afterInstall(options) {
     // Perform extra work here.
     // Add addons to package.json and run defaultBlueprint
     return this.addAddonsToProject({
      // a packages array defines the addons to install
      packages: [
        // name is the addon name, and target (optional) is the version
        {name: 'ember-browserify'},
        {name: 'ember-moment'}
      ]
    })
    .then(() => {
      // Add npm packages to package.json
      return this.addPackagesToProject([
        {name: 'seisplotjs', target: '^1.1.0'}
      ]);
    });
   }
};
