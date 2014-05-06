define([
  'vertebrae/model' 
], function(BaseModel) {

  var Repos = BaseModel.extend({

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