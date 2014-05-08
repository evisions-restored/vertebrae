define([
  'vertebrae' 
], function(Vertebrae) {

  var Repos = Vertebrae.Model.extend({

  }, 
  {

    rootUrl: 'https://api.github.com/',

    routes: {
      'GET users/:$0/repos': 'requestAllByUser'
    },

    parsers: {
      'users/:user/repos': 'models'
    }

  });

  return Repos;
});