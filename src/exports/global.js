define([
  '../core'
], function(Vertebrae) {

  var _Vertebrae = window.Vertebrae,
      _V        = window.V;

  Vertebrae.noConflict = function( deep ) {
    if (window.V === Vertebrae) {
      window.V = _V;
    }

    if (deep && window.Vertebrae === Vertebrae) {
      window.Vertebrae = _Vertebrae;
    }

    return Vertebrae;
  };

  if (typeof noGlobal === 'undefined') {
    window.Vertebrae = window.V = Vertebrae;
  }
});