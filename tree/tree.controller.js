define(['evisions/controller', 'evisions/tree/tree.view', 'evisions/helper'], function(EVIController, TreeView, helper) {
  /**
   * @class 
   * @memberOf Evisions
   */
  var TreeController = EVIController.extend(/** @lends Evisions.TreeController */{

    properties: ['model', 'options', 'initialized', 'selected'],

    defaultOptions: {
      dotted: false,
      root: true
    },

    initialize: function(options) {
      options = helper.extend({}, this.defaultOptions, options);
      this.setSelected([]);
      this.setOptions(options);
      this.setModel(options.model);
      this._super.apply(this, arguments);
    },

    setupView: function() {
      this.setView(new TreeView());
    },

    viewIsReady: function() {
      this.getView().render();
      this.load();
    },

    /**
     * Load the tree controller
     *
     * @function
     * @instance
     * 
     * @param  {Object | None} model Load the tree view with the optional root param.
     * 
     * @return {Deferred}       Resolved when all initialization is done.
     */
    load: function(model) {

      if (model != null) {
        this.setModel(model);
      }

      var d = helper.deferred(),
          that    = this,
          options = this.getOptions(),
          view    = this.getView(),
          model   = model || this.getModel();

      if (options.root) {
        view.renderRootNode(model)
            .done(function(node) { 
              that.requestNodeSelect(model, node);
              that.findModelChildren(model)
                  .done(function(children) { 
                    view.expandNode(children, node)
                        .always(function() { that.setInitialized(true); })
                  }); 
            });
      } else {
        this.requestChildren(model)
            .done(function(children) { 
              view.renderRootNodes(children)
                  .always(function() { that.setInitialized(true); })
                  .done(d.resolve)
                  .fail(d.reject); 
            });
      }
      return d;
    },

    /**
     * Tells if the tree controller has finished initializing or not.
     *  
     * @function
     * @instance
     * 
     * @return {Boolean} [description]
     */
    isInitialized: function() {
      return !!this.getInitialized();
    },

    /**
     * Tells if the given model is in fact the root of the entire tree.
     * 
     * @function
     * @instance
     * 
     * @param  {Object} model 
     * 
     * @return {Boolean}       
     */
    isModelRoot: function(model) {
      return this.getModel() === model;
    },

    /**
     * Tells if the given model is expandable or not.
     *
     * @function
     * @instance
     * @override
     *
     * @param {Object} model 
     * 
     * @return {Deferred} 
     */
    isModelExpandable: function(model) {
      var d = helper.deferred();
      d.resolve(true);
      return d;
    },

    /**
     * Tells if the given model is selectable or not.
     *
     * @function
     * @instance
     * @override
     *
     * @param {Object} model 
     * 
     * @return {Deferred} 
     */
    isModelSelectable: function(model) {
      var d = helper.deferred();
      d.resolve(true);
      return d;
    },

    /**
     * Tells if the given model is dropable or not.
     *
     * @function
     * @instance
     * @override
     * 
     * @param  {Object} model 
     * 
     * @return {Deferred}       
     */
    isModelDropable: function(model) {
      var d = helper.deferred();
      d.resolve(false);
      return d;
    },

    /**
     * Tells if the given model is draggable.
     *
     * @function
     * @instance
     * @override
     * 
     * @param  {Object} model 
     * 
     * @return {Deferred}       
     */
    isModelDragable: function(model) {
      var d = helper.deferred();
      d.resolve(false);
      return d;
    },

    /**
     * Tells if we can perform an edit on the given model and node.
     *
     * @function
     * @instance
     * @override
     * 
     * @param  {Object} model 
     * @param  {jQuery} node  
     * 
     * @return {Boolean}       
     */
    canPerformEdit: function(model, node) {
      return true;
    },

    /**
     * Gets the template to used to render the node contents.
     *
     * @function
     * @instance
     * @override
     * 
     * @return {String} 
     */
    getNodeTemplate: function() {
      return 'tree.node.contents';
    },

    /**
     * Gets the datum to be used with the node template.
     *
     * @function
     * @instance
     * 
     * @param  {Object} model 
     * 
     * @return {Object}       
     */
    getNodeDatum: function(model) {
      return {
        Name: this.getNameForModel(model)
      }
    },

    /**
     * Gets the name to be used with the given model.
     *
     * @function
     * @instance
     * @override
     * 
     * @param  {Object} model 
     * 
     * @return {String}       
     */
    getNameForModel: function(model) {
      return 'need to override this function';
    },

    /**
     * Sets teh name on the given model.
     *
     * @function
     * @instance
     * @override
     *
     * @param {Object} model 
     */
    setNameForModel: function(model) {

    },

    /**
     * Request from the view to edit the given model to the given name.
     *
     * @function
     * @instance
     * 
     * @param  {Object} model 
     * @param  {String} name  
     * 
     * @return {Boolean}       
     */
    requestEditForModel: function(model, name) {
      if (!name) {
        // We cannot edit the name if its name is an empty string or null or undefined.
        return false;
      }
      return this.setNameForModel(model, name) === false ? false : true;
    },

    /**
     * Find/Get the children for a given model.
     *
     * @function
     * @instance
     * @override
     * 
     * @param  {Object} model 
     * 
     * @return {Deferred}       
     */
    findModelChildren: function(model) {
      var d = helper.deferred();
      d.resolve([]);
      return d;
    },

    /**
     * Finds a node from the children of the given node that matches the given model.
     *
     * @function
     * @instance
     * 
     * @param  {Object} model  The model of the associated node we are trying to find.
     * @param  {jQuery} parent The node whose children we want to search
     * 
     * @return {jQuery | null}        
     */
    findNodeFromModel: function(model, parent) {
      var view = this.getView(),
          childNodes = view.getChildNodes(parent),
          toCheck = null,
          i = 0

      for (i = 0; i < childNodes.length; ++i) {
        toCheck = view.getModelFromNode(childNodes[i]);
        if (model === toCheck) {
          return childNodes.eq(i);
        }
      }
      return null;
    },

    /**
     * Called when a model is selected.
     *
     * @function
     * @instance
     * @override
     * 
     * @param  {Object} model 
     */
    modelWasSelected: function(model) {

    },

    /**
     * Called when a model is deselected.
     *
     * @function
     * @instance
     * @override
     * 
     * @param  {Object} model 
     */
    modelWasDeselected: function(model) {

    },

    /**
     * Called when a model is expanded.
     *
     * @function
     * @instance
     * @override
     * 
     * @param  {Object} model 
     */
    modelDidExpand: function(model) {

    },

    /**
     * Called when a model is collpased.
     *
     * @function
     * @instance
     *
     * @param {Object} model 
     */
    modelDidCollapse: function(model) {

    },

    /**
     * Refresh the children of the of the currently selected node.
     *
     * @function
     * @instance
     * 
     * @return {Deferred} 
     */
    refreshSelected: function() {
      var selected = this.getSelected();
          view = this.getView(),
          that = this,
          d = helper.deferred(),
          iterator = null,
          i = 0;

      iterator = function(select, index) {
        view.clearChildren(select.node);
        return that.requestNodeExpand(select.model, select.node);
      }

      helper.forEachSeries(selected, iterator)
          .done(function() { d.resolve(selected); })
          .fail(d.reject)

      return d;
    },

    /**
     * Tells if the given model should be expanded when the tree view is initialized.
     *
     * @function
     * @instance
     * @override
     *
     * @param {Object} model 
     * 
     * @return {Deferred} 
     */
    shouldExpandModelOnInit: function(model) {
      var d = helper.deferred();
      d.resolve(false);
      return d;
    },

    /**
     * Tells if the given model should be selected when the tree view is initialized.
     *
     * @function
     * @instance
     * @override
     *
     * @param {Object} model 
     * 
     * @return {Deferred} 
     */
    shouldSelectModelOnInit: function(model) {
      var d = helper.deferred();
      d.resolve(false);
      return d;
    },

    /**
     * Request from the view to selected the given node.
     *
     * @function
     * @instance
     * 
     * @param  {Object} model 
     * @param  {jQuery} node  
     * 
     * @return {Deferred}       
     */
    requestNodeSelect: function(model, node) {
      var that = this,
          d = helper.deferred(),
          options = this.getOptions(),
          selected = this.getSelected() || [],
          i = 0,
          view = this.getView();
      if (options.multiSelect === true) {
        // Handle multi-select here.

      } else {
        // Handle single-select here.
        for (i = 0; i < selected.length; ++i) {
          view.deselectNode(selected[i].node);
          this.modelWasDeselected(selected[i].model);
        }
        selected = [];
      }
      selected.push({ model: model, node: node });
      this.setSelected(selected);
      view.selectNode(node);
      this.modelWasSelected(model);
      d.resolve(model, node);
      return d;
    },

    /**
     * Request from the givew to expand the given node.
     *
     * @function
     * @instance
     * 
     * @param  {Object} model 
     * @param  {jQuery} node  
     * 
     * @return {Deferred}       
     */
    requestNodeExpand: function(model, node) {
      var that = this,
          d = helper.deferred(),
          view = this.getView();

      this.findModelChildren(model)
          .done(function(children) {
            view.expandNode(children, node)
                .done(function() { 
                  that.modelDidExpand(model); 
                  d.resolve(model, node); 
                })
                .fail(d.reject);
          })
          .fail(d.reject);

      return d;
    },

    /**
     * Request from the view to collapse the given node.
     *
     * @function
     * @instance
     * 
     * @param  {Object} model 
     * @param  {jQuery} node  
     * 
     * @return {Deferred}       
     */
    requestNodeCollapse: function(model, node) {
      var that = this,
          view = this.getView();
      return view.collapseNode(node)
          .done(function() { that.modelDidCollapse(model); });
    },

    unload: function() {
      return this._super();
    }

  });
  return TreeController;
});
