define([
  'vertebrae/model' 
], function(BaseModel) {

  var User = BaseModel.extend({

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