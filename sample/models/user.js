define([
  'vertebrae' 
], function(Vertebrae) {

  var User = Vertebrae.Model.extend({

    properties: [
      'email',
      'name',
      'likes'
    ],

    defaults: function() {
      return {
        email: '',
        name: '',
        likes: 0
      };
    },

    increaseLikeCount: function() {
      var likes = this.getLikes();

      this.setLikes(likes+1);
    }

  });

  return User;
});