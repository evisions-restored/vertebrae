var AJAX = function() {
  var objSelf = this;
  
  /**
   * This struct will cache the current XMLHTTP requests
   * so that we can reference them in a call fails.
   */
  this.currentRequests = {};
  
  /**
   * Keeping the counter of active AJAX calls. It will be used to hide or show the AJAX loader.
   */
  this.activeAjaxCounter = 0;
  
  /**
   * Default wait timer.
   */
  this.delayShowLoader = 1000;
  
  /**
   * Setting the ability to show the loading message or keep it hidden.
   */
  this.silent = false;
} 

/**
 * Set 'true', if view needs to be disabled during AJAX call.
 */
AJAX.prototype.disableView = true;

/**
 * UIHelper to use from this AJAX.
 */
AJAX.prototype.uiHelperRef = null;

/**
 * Reference to the element, making the AJAX call.
 */
AJAX.prototype.sourceElement = null;

AJAX.prototype.executionQueue = [];

AJAX.prototype.PushToExecutionQueue = function(arguments)
{
  this.executionQueue.push(arguments);
}

AJAX.prototype.InvokeExecutionQueue = function()
{
  if (this.executionQueue.length == 0 || this.executingRequest)
    return;
  var argList = this.executionQueue.shift(),
  requestName = argList[0],
  requestUrl = argList[1],
  requestData = argList[2],
  fnCallback = argList[3],
  executedCallback = argList[4];

  executedCallback = executedCallback ? executedCallback : function() {};
  executedCallback(this.Execute(requestName, requestUrl, requestData, fnCallback, 'json', 'POST'));
}

/**
 * This handles the JSON request. This checks to see if the current
 * request is already being processed and also handles any error
 * wiring that is required.
 */
AJAX.prototype.PostJSON = function(requestName, requestUrl, requestData, fnCallback, executedCallback, otherOptions) {
  /**
   * This functions handles the JSON request. It will validate that a request wil the same name doesn't execute twice and
   * it also handles any error wiring that is required.
   */
  var objSelf = this;

  if (!this.executingRequest)
  {
    executedCallback = executedCallback ? executedCallback : function() {};
    executedCallback(objSelf.Execute(requestName, requestUrl, requestData, fnCallback, 'json', 'POST', otherOptions || {}));
  } else {
    objSelf.PushToExecutionQueue(arguments);
  }

  
}



AJAX.prototype.Execute = function(requestName, requestUrl, requestData, fnCallback, callDataType, callMethod, otherOptions) {
  otherOptions = otherOptions || {};
  // var temp = fnCallback;
  // fnCallback = function(a,b,c,d,e,f,g) {
  //   setTimeout(function() {
  //     temp(a,b,c,d,e,f,g);
  //   },200);
  // }
  /**
   * This function will be call internally by the AJAXHelper class.
   */
  var objSelf = this;
  
  /**
   * We have to check to see if this request is
   * already being processed. We don't want the user to
   * try and fire off multiple requests of the same type.
   * If the name is NULL, this check doesn't matter.
   */
  if (!requestName || !this.currentRequests[requestName]) {
    //we are busy executing a request
    this.executingRequest = true;  

    /**
     * Store the current request.
     */
    objSelf.currentRequests[requestName] = true;
    if (!objSelf.uiHelperRef)
      objSelf.uiHelperRef = new UIHelper();
      
    /**
     * If this is the first call then we need to initiate the AJAX
     * loader. On subsequent calls, we can skip the initiation of the loader,
     * because the loader will already be shown from a previous call.
     */
    if (objSelf.activeAjaxCounter == 0) {
      setTimeout(
        function() {
          /**
           * This will continue to show the loader if there are more
           * active calls still in the queue.
           */
          if (objSelf.activeAjaxCounter > 0 && !objSelf.silent)
            objSelf.uiHelperRef.ShowAJAXLoader(objSelf.disableView);
        }, objSelf.delayShowLoader);
    }
    
    /**
     * Increment the queue counter.
     */
    objSelf.activeAjaxCounter++;
    
    var dateBuster = new Date();
    /**
     * Making the actual AJAX request.
     */
    return $.ajax({
      /**
       * Basic AJAX properties.
       */
      //when adding the cache buster, make sure the url doens't have any existing query string params in it, if it does, add it with an '&' sign
      url: requestUrl.indexOf('?') == -1 ? requestUrl + '?_cacheBuster=' + dateBuster.getTime() : requestUrl + '&_cacheBuster=' + dateBuster.getTime(),
      async: otherOptions.noAsync === true ? false : true,
      data: requestData,
      dataType: callDataType,
      type: callMethod,
      
      /**
       * Success handler.
       */
      success: function(objResponse) {
        /**
         * Remove the request flag from the queue.
         */
        objSelf.currentRequests[requestName] = false;
      

        /**
         * Passing off the success handler.
         */
        if (callDataType == 'json') {
          objSelf.AJAXSuccessHandler(objSelf, objResponse, fnCallback);
        } else {
          fnCallback(objResponse);
        }
        
        /**
         * Decrease the queue count.
         */
        objSelf.activeAjaxCounter--;

        /**
         * Was there an uncaught error in the response?  if so, throw the global error message
         */
        // Argosweb.ErrorManager.throwError(objResponse);

        
        /**
         * Close the Loading UI if queue is empty
         */
        if (objSelf.activeAjaxCounter == 0)
          objSelf.uiHelperRef.HideAJAXLoader();
      },
      
      /**
       * Error handler.
       */
      error: function(objResponse, textStatus) {
        /**
         * Remove the request flag from the queue.
         */
        objSelf.currentRequests[requestName] = false;
        
        /**
         * Decrease the queue count.
         */
        objSelf.activeAjaxCounter--;
        
        /**
         * Close the Loading UI if queue is empty
         */
        if (objSelf.activeAjaxCounter == 0)
          objSelf.uiHelperRef.HideAJAXLoader();

        /**
         * Pass through to the error display handler.
         */
        objSelf.AJAXFailHandler(
          objSelf,
          objResponse,
          textStatus,
          fnCallback
        );
      }
    })
  } else {
    /**
     * Write logging code for multiple queue event entries.
     */
     this.executingRequest = false;
     this.InvokeExecutionQueue();
  }
}

AJAX.prototype.AJAXSuccessHandler = function(objAJAXCaller, objResponse, fnCallback) {
  this.executingRequest = false;
  this.InvokeExecutionQueue();
  /**
    * Check if the response is an error and set a flag on it.  This way it can be dealt with appropriately
    */
  // Argosweb.ErrorManager.processResponseForErrors(objResponse);
  /**
   * This function will handle all the successful AJAX requests.
   */
  fnCallback(objResponse, objAJAXCaller.SourceElement);
}

AJAX.prototype.AJAXFailHandler = function(objAJAXCaller, objResponse, textStatus, fnCallback) {

  this.executingRequest = false;
  this.InvokeExecutionQueue();
  /**
   * This function will handle all the failed AJAX requests.
   */
  objAJAXCaller.uiHelperRef.CreateAJAXResponseErrorMessage(objResponse.responseText);
  /**
    * Check if the response is an error and set a flag on it.  This way it can be dealt with appropriately
    */
  objResponse.valid = false;
  objResponse.data = "";
  objResponse.code = -1;
  // Argosweb.ErrorManager.processResponseForErrors(objResponse);
  fnCallback(objResponse);
}

var UIHelper = function() {};

UIHelper.prototype.ShowAJAXLoader = function(disableView) {
  /**
   * Displays the loader at the top center of the browser window.
   */
  var objSelf = this;
  
  /**
   * This will make sure we don't make unnecessary calls to hide the loader.
   */
  objSelf.ajaxLoaderShown = true;
  // $('#loadingFeedback').show('fast'); //removing loading feedback until we decide how/when we want to display loading feedback to the user
}

UIHelper.prototype.HideAJAXLoader = function() {
  /**
   * Hides the loader at the top center of the browser window.
   */
  var objSelf = this;
  
  if (objSelf.ajaxLoaderShown) {
    // $('#loadingFeedback').hide('fast');
    objSelf.ajaxLoaderShown = false;
  }
}

UIHelper.prototype.CreateAJAXResponseErrorMessage = function(message) {
  
}

UIHelper.prototype.ShowMessageDialog = function(title, message) {
  
}

/**
 * Creating a usuable reference to the AJAX Centralized Caller.
 * Loading feedback will be dislayed to the user.
 */
var AJAXER = new AJAX();

/**
 * Creating a usuable reference to the AJAX Centralized Caller.
 * Loading feedback will be dislayed to the user.
 */
var SAJAXER = new AJAX();
SAJAXER.silent = true;