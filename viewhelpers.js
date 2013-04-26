define(['handlebars.runtime'], function(Handlebars) {

  Handlebars.registerHelper('dateString', function(dateObject) {
    if (_.isDate(dateObject)) {
      return dateObject.toDateString();
    } else {
      return dateObject;
    }
  });

  Handlebars.registerHelper('unescapeHTML', function(str) {
    return EVI.Helper.unescapeHTML(str);
  });

  Handlebars.registerHelper('cancelButton', function() {
    var options = {
      text: 'Cancel',
      action: 'cancel',
      icon: 'share-alt'
    };
    return Handlebars.helpers.button(options);
  });

  Handlebars.registerHelper('closeButton', function() {
    var options = {
      text: 'Close',
      action: 'close',
      icon: 'share-alt'
    };
    return Handlebars.helpers.button(options);
  });

  Handlebars.registerHelper('applyButton', function() {
    var options = {
      text: 'Apply',
      color: 'blue',
      action: 'apply',
      icon: 'ok'
    };
    return Handlebars.helpers.button(options);
  });

  var colorMap = {
    blue: 'btn-primary',
    green: 'btn-success',
    black: 'btn-inverse',
    red: 'btn-danger',
    white: '',
    link: 'btn-link'
  };

  Handlebars.registerHelper('button', function(o) {
    var str = '<a class="btn';
    if (o.color) {
      str += ' ';
      if (colorMap[o.color]) {
        str += colorMap[o.color];
      } else {
        str += o.color;
      }
    }
    if (o.position == 'left') {
      str += ' pull-left';
    }
    str += '"'
    if (o.action) {
      str += ' data-action="';
      str += o.action;
      str += '"';
    }
    if (o.dismiss) {
      str += ' data-dismiss="modal"'
    }
    str += '>';
    if (o.icon) {
      str += '<i class="icon-';
      str += o.icon;
      if (o.color && o.color != 'white' && o.color != 'link') {
        str += ' ';
        str += 'icon-white';
      }
      str += '"></i> ';
    }
    str += o.text != null ? o.text : '';
    str += '</a>';
    return new Handlebars.SafeString(str);
  });

});