define([
  '../core'
], function(Vertebrae) {

  var _Vertebrae  = win.Vertebrae,
      _V          = win.V;

  Vertebrae.noConflict = function(deep) {
    if (win.V === Vertebrae) {
      win.V = _V;
    }

    if (deep && win.Vertebrae === Vertebrae) {
      win.Vertebrae = _Vertebrae;
    }

    return Vertebrae;
  };

  if (typeof noGlobal === 'undefined') {
    win.Vertebrae = win.V = Vertebrae;
  }
  
});