define(['evisions/view', 'evisions/helper'], function(EVIView, helper) {
  /**
   * @class
   * @memberOf Evisions
   */
  var TreeView = EVIView.extend(/** @lends Evisions.TreeView */{

    templates: {
      'tree.init': 'renderInitFragment',
      'tree.node': 'renderNodeFragment'
    },

    events: {
      'click .node.selectable:not(.selected)'            : 'handleNodeSelect',
      'click .node.selected'                             : 'handleNodeDeselect',
      'click .node.expandable:not(.expanded) .nodeExpand': 'handleNodeExpand',
      'click .node.expandable.expanded .nodeExpand'      : 'handleNodeCollapse',
      'draginit .not.dragable.selectable .nodeContainer' : 'handleDragStart',
      'dragend .node.dragable.selectable .nodeContainer' : 'handleDragStop',
      'dropon .node.dropable > .nodeData'                : 'handleDrop',
      'dropover .node.dropable > .nodeData'              : 'handleDropHoverEnter',
      'dropout .node.dropable > .nodeData'               : 'handleDropHoverOut',
      'dropmove .node.dropable > .nodeData'              : 'handleDropMove',
      'enterkey .node > .nodeData input.nameEdit'        : 'handleNodeEditFinish',
      'blur .node > .nodeData input.nameEdit'            : 'handleNodeEditFinish',
      'click .node [action="edit"]'                      : 'handleEditAction',
      'click input.nameEdit'                             : 'stopPropagation',
      'keyup input'                                      : 'stopPropagation'
    },

    render: function() {
      this.$el.html(this.renderInitFragment());
      this.setupScroll();
    },

    /**
     * Render a model that is the root node
     *
     * @function
     * @instance
     * 
     * @param  {Object} model 
     * 
     * @return {Deferred}       
     */
    renderRootNode: function(model) {
      var parent = this.$('.argosWebTreeView');
      return this.renderNode(model, parent)
          .done(function(node) { node.addClass('root'); });
    },

    /**
     * Render the children of the root model
     * 
     * @param  {Array} models Array of models that are children of the root
     * 
     * @return {Deferred}        
     */
    renderRootNodes: function(models) {
      var container = this.$('.argosWebTreeView');
      return this.renderNodes(models, container);
    },

    /**
     * Renders the given nodes to the given contianer.
     *
     * @function
     * @instance
     * 
     * @param  {Array} models    Array of children
     * @param  {jQuery} container The container to render the children to.
     * 
     * @return {Deferred}           
     */
    renderNodes: function(models, container) {
      var dChildren = null,
          d = helper.deferred();
          that = this;

      dChildren = helper.forEachSeries(models, function(model, index) {
        return that.renderNode(model, container)
            .done(function(node) { 
              if (index == models.length-1) {
                node.addClass('last');
              } else if (index == 0) {
                node.addClass('first');
              }
            });
      });

      dChildren
          .done(function() { d.resolve(that.getChildNodes(container)); })
          .fail(d.reject);

      return d;
    },

    /**
     * Render a single node to the given container
     *
     * @function
     * @instance
     * 
     * @param  {Object} model     
     * @param  {jQuery} container 
     * 
     * @return {Deferred}           
     */
    renderNode: function(model, container) {
      var delegate = this.getDelegate(),
          d        = helper.deferred(),
          that     = this,
          options  = delegate.getOptions(),
          data     = helper.extend({}, options, { model: model }),
          fragment = this.renderNodeFragment(data, true),
          node     = fragment.children(0),
          handleSelect = null,
          resolver = helper.resolveAfter(d, 5, node);

      this.renderNodeContents(model, node.find('.nodeContainer'));

      container.append(fragment);

      delegate.isModelExpandable(model)
          .always(function(expandable) {
            if (expandable) {
              node.addClass('expandable');
            }
          })
          .always(resolver);

      delegate.isModelSelectable(model)
          .always(function(selectable) {
            if (selectable) {
              node.addClass('selectable');
            }
          })
          .always(resolver);

      delegate.isModelDropable(model)
          .always(function(dropable) {
            if (dropable) {
              node.addClass('dropable');
            }
          })
          .always(resolver);

      delegate.isModelDragable(model)
          .always(function(dragable) {
            if (dragable) {
              node.addClass('dragable');
            }
          })
          .always(resolver);

      handleSelect = function() {
        delegate.shouldSelectModelOnInit(model)
            .done(function(select) {
              if (select) {
                delegate.requestNodeSelect(model, node).always(resolver);
              } else {
                resolver();
              }
            })
            .fail(resolver);
      };

      if (!delegate.isInitialized()) {
        if (delegate.isModelRoot(model)) {
          handleSelect();
        } else {
          delegate.shouldExpandModelOnInit(model)
              .always(function(shouldExpand) {
                if (shouldExpand) {
                  delegate.requestNodeExpand(model, node).always(handleSelect);
                } else {
                  handleSelect();
                }
              });
        }
      } else {
        resolver();
      }

      return d;
    },

    /**
     * Render the contents of a node.  This is the visible section that the user interacts with
     *
     * @function
     * @instance
     * 
     * @param  {Object} model 
     * @param  {jQuery} el    
     */
    renderNodeContents: function(model, el) {
      var delegate = this.getDelegate();
      el.html(this.renderFragment(delegate.getNodeTemplate(model), delegate.getNodeDatum(model)));
    },

    /**
     * Expand the given node and fill it with the given children
     *
     * @function
     * @instance
     * 
     * @param  {Array} children Children of the node we are expanding.
     * @param  {jQuery} node     The node that is being expanded
     * 
     * @return {Deferred}          
     */
    expandNode: function(children, node) {
      var container = this.getChildContainer(node),
          that = this;

      return this.renderNodes(children, container)
          .done(function() { node.addClass('expanded'); })
          .done(function() { that.applyGridLineHeight(node); })
          .done(function() { that.nodeDidExpand(node); })
    },

    /**
     * Called when a node is expanded
     *
     * @function
     * @instance
     * @override
     *
     * @param {jQuery} node 
     */
    nodeDidExpand: function(node) {

    },

    /**
     * Collapse the given node
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} node 
     * 
     * @return {Deferred}      
     */
    collapseNode: function(node) {
      var d = helper.deferred();

      this.clearChildren(node);
      node.removeClass('expanded');
      this.applyGridLineHeight(node);
      this.nodeDidCollapse(node);

      d.resolve();

      return d;
    },

    /**
     * Called when a node has collapsed
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} node 
     */
    nodeDidCollapse: function(node) {

    },

    addNode: function(node, parent) {

    },

    deleteNode: function(node) {

    },

    /**
     * Select the given node
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} node 
     */
    selectNode: function(node) {
      node.addClass('selected');
      this.nodeWasSelected(node);
    },

    /**
     * Called when a node is selected.
     *
     * @function
     * @instance
     * 
     * @param {jQuery} node 
     */
    nodeWasSelected: function(node) {

    },

    /**
     * Deselect the given node.
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} node 
     */
    deselectNode: function(node) {
      node.removeClass('selected');
      this.nodeWasDeselected(node);
    },

    /**
     * Called when a node is deselected
     *
     * @function
     * @instance
     *
     * @param {jQuery} node 
     */
    nodeWasDeselected: function(node) {

    },

    /**
     * Edit the name of a node.
     *
     * @function
     * @instance
     * 
     * @param  {Object} model 
     * @param  {jQuery} node 
     */
    editNodeName: function(model, node) {
      var container = node.children('.nodeData').find('.nodeContainer'),
          delegate = this.getDelegate();
          
      node.addClass('editing');

      container.find('span').hide();
      container.append('<input class="nameEdit" type="text" value="' + delegate.getNameForModel(model) + '">');
      container.find("input").focus();

      this.applyGridLineHeight(node);
    },

    /**
     * Tells if a node is selected
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} node 
     * 
     * @return {Boolean}      
     */
    isNodeSelected: function(node) {
      return node.hasClass('selected');
    },

    /**
     * Get all the selected nodes.
     *
     * @function
     * @instance
     * 
     * @return {jQuery} 
     */
    getSelectedNodes: function() {
      return this.$('.node.selected');
    },

    /**
     * Clear the children for the given node.
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} node 
     */
    clearChildren: function(node) {
      var container = this.getChildContainer(node);
      if (container) {
        container.empty();
      }
    },

    /**
     * Saved the current scroll position.
     *
     * @function
     * @instance
     * 
     */
    saveScroll: function() {

    },

    setScroll: function() {

    },

    /**
     * Scroll to the given node
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} node 
     */
    scrollTo: function(node) {

    },

    /**
     * Get the child container for a node.
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} node 
     * 
     * @return {jQuery}     
     */
    getChildContainer: function(node) {
      return $(node).children('.nodeChildren');
    },

    /**
     * Get the children of a node.
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} node 
     * 
     * @return {jQuery}      
     */
    getChildNodes: function(node) {
      var container = this.getChildContainer(node);
      return container.children('.node');
    },

    /**
     * Once the height of a node has changed in any way, its gridlines need to be recalculated.
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} node 
     */
    applyGridLineHeight: function(node) {

      this.updateScroll();

      var options = this.getDelegate().getOptions();

      if (!node || !options.gridLines) { return this; }

      var gridLine = node.children('.nodeData').find('.gridLine'),
          parent = this.getNearestNodeFromElement(node.parent()),
          newHeight = node.outerHeight();

      if (options.dotted) {
        newHeight = newHeight-1;
      }

      if (!node.hasClass('last')) {
        gridLine.height(newHeight);
      }

      while (parent != null) {
        this.applyGridLineHeight($(parent));
        parent = this.getNearestNodeFromElement(parent.parentNode);
      }
    },

    setupScroll: function() {
      helper.setupScroll(this.$el);
    },

    updateScroll: function() {
      helper.updateScroll(this.$el);
    },

    resetGridLineClasses: function(node) {

    },

    /**
     * Gets the nearest node element from a child/descendant of a node element.
     *
     * @function
     * @instance
     * 
     * @param  {Element|jQuery} el 
     * 
     * @return {Element}    
     */
    getNearestNodeFromElement: function(el) {
      // Get rid of jquery.
      if (el instanceof $) {
        el = el.get(0);
      }

      var nodeRegex = /^node | node | node$|^node$/,
          node = el,
          treeViewRegex = /^argosWebTreeView | argosWebTreeView | argosWebTreeView$|^argosWebTreeView$/;
      // Search through the parent nodes until we find the root of the whole tree OR we find an actually tree node.
      while (true) {
        if (nodeRegex.test(node.className)) {
          break;
        } else if (treeViewRegex.test(node.className)) {
          node = null;
          break;
        }
        node = node.parentNode;
      }
      return node;
    },

    /**
     * Get the associated model from a node.
     *
     * @function
     * @instance
     * 
     * @param  {Element|jQuery} node 
     * 
     * @return {Object}      
     */
    getModelFromNode: function(node) {
      var data = helper.datum(node);
      if (data) {
        return data.model;
      }
    },

    getDragFragment: function(model) {

    },

    /**
     * Event handle for when a user clicks on a node.
     *
     * @function
     * @instance
     * 
     * @param  {Event} ev 
     */
    handleNodeSelect: function(ev) {
      var node = this.getNearestNodeFromElement(ev.currentTarget),
          delegate = this.getDelegate(),
          model = null;
      if (node) {
        model = this.getModelFromNode(node);
        node = $(node);
        if (model) {
          delegate.requestNodeSelect(model, node);
          ev.stopPropagation();
        }
      }
    },

    /**
     * Event handle for whne a user clicks on something other than the selected node.
     * 
     * @function
     * @instance
     * 
     * @param  {Event} ev 
     */
    handleNodeDeselect: function(ev) {
      ev.stopPropagation();
    },

    /**
     * Event handle for when a user clicks on the expand node button.
     *
     * @function
     * @instance
     * 
     * @param  {Event} ev 
     */
    handleNodeExpand: function(ev) {
      var node = this.getNearestNodeFromElement(ev.currentTarget),
          delegate = this.getDelegate(),
          model = null;

      if (node) {
        model = this.getModelFromNode(node);
        node = $(node);
        if (model) {
          ev.stopPropagation();
          ev.preventDefault();
          delegate.requestNodeExpand(model, node);
        }
      }
    },

    /**
     * Event handle for when a user clicks on the collapse node button.
     *
     * @function
     * @instance
     * 
     * @param  {Event} ev 
     */
    handleNodeCollapse: function(ev) {
      var node = this.getNearestNodeFromElement(ev.currentTarget),
          delegate = this.getDelegate(),
          model = null;
      if (node) {
        model = this.getModelFromNode(node);
        node = $(node);
        if (model) {
          delegate.requestNodeCollapse(model, node);
          ev.stopPropagation();
        }
      }
    },

    /**
     * Event handle for when a user clicks on anything that has the edit action attribute.
     * 
     * @example
     * <div action="edit">Edit Node</div>
     *
     * @function
     * @instance
     * 
     * @param  {Event} ev 
     */
    handleEditAction: function(ev) {
      var nodeRaw = this.getNearestNodeFromElement(ev.currentTarget),
          model = this.getModelFromNode(nodeRaw),
          node = $(nodeRaw),
          delegate = this.getDelegate();

      ev.stopPropagation();

      if (model && nodeRaw && delegate.canPerformEdit(model, node)) {
        this.editNodeName(model, node);
      }
    },

    /**
     * Event handle for when the user is done editing a node name.  This is usually the enter key or the blur event.
     *
     * @function
     * @instance
     * 
     * @param  {Event} ev 
     */
    handleNodeEditFinish: function(ev) {
      // When handling the enterkey and removing the element it will call the blur event.
      // This will cause this function to be called twice which will in turn cause the element to be removed twice (which will throw an error).
      // Added the following hasHandledEdit flag to deal with this issue.
      if (ev.currentTarget.hasHandledEdit === true) {
        // We have already dealt with you.
        return;
      }
      var nodeRaw = this.getNearestNodeFromElement(ev.currentTarget),
          model = this.getModelFromNode(nodeRaw),
          node = $(nodeRaw),
          delegate = this.getDelegate(),
          container = node.children('.nodeData').find('.nodeContainer'),
          input = container.find('input.nameEdit'),
          name = input.val(),
          span = container.find('span.highlight');

      node.removeClass('editing');

      ev.stopPropagation();
      ev.preventDefault();


      if (delegate.requestEditForModel(model, name)) {
        ev.currentTarget.hasHandledEdit = true;
        span.text(delegate.getNameForModel(model)).show();
        input.remove();
        delegate.nodeEditDidFinish(model, node);
      } else {
        input.focus();
      }

    },

    handleDragStart: function() {

    },

    handleDragStop: function() {

    },

    handleDropHoverEnter: function() {

    },

    handleDropHoverOut: function(el, ev, drop) {

    },

    handleDrop: function() {

    },

    handleDropMove: function() {

    },

    isNodeChild: function(parent, child) {

    },

    isNodeDescendant: function(parent, child) {

    },

    isNodeSibling: function(node, sibling) {

    },

    canPerformDrop: function() {

    },
    
    stopPropagation: function(ev) {
      ev.stopPropagation();
    },

    unload: function() {
      helper.destroyScroll(this.$el);
      return this._super();
    }

  });
  return TreeView;
});