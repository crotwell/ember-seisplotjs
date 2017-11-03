/* eslint-env node */
module.exports = {
  description: ''

  // locals(options) {
  //   // Return custom template variables here.
  //   return {
  //     foo: options.entity.options.foo
  //   };
  // }

   afterInstall(options) {
     // Perform extra work here.
     // Add addons to package.json and run defaultBlueprint
    return this.addPackagesToProject([
        {name: 'seisplotjs'},
      ]);
   }
};
