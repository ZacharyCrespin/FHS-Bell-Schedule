const functions = require('@google-cloud/functions-framework');

const buildHook = "https://api.netlify.com/build_hooks/6480ffb5b3dfa84c24f552a4"

functions.http('nightly', (req, res) => {
  fetch(buildHook, {method: 'POST'});
});
