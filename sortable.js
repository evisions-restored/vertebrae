define(['evisions/view', 'eventdrag'], function(EVIView) {
  /**
   * @class
   * @memberOf Evisions
   * @augments {Evisions.EVIView}
   */
  var EVISortable = EVIView.extend(/** @lends  Evisions.EVISortable */{

    /**
     * @synthesize sortableElements
     * @memberOf Evisions.EVISortable
     */
    
    /**
     * @synthesize sortablePositions
     * @memberOf Evisions.EVISortable
     */
    
    /**
     * @synthesize elementSelector
     * @memberOf Evisions.EVISortable
     */

    properties: ['sortableElements', 'sortablePositions', 'elementSelector'],

    options: {
     distance: 5
    },

    /**
     * Set the sortable elements by a selector and set any options
     *
     * @function
     * @instance
     * 
     * @param  {String} elementSelector 
     * @param  {Object} options         
     * 
     * @return {None}                 
     */
    setupSortable: function(elementSelector, options) {
      this.setElementSelector(elementSelector);
      var sortable = this.$el.find(elementSelector)
        .on('drag', _.extend({}, this.options, options), this.handleDrag.proxy(this))
        .on('draginit', this.handleDragInit.proxy(this))
        .on('dragstart', this.handleDragStart.proxy(this))
        .on('dragend', this.handleDragEnd.proxy(this));
      this.setSortableElements(sortable);
    },

    /**
     * Switch two sortable elements on the dom
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} leftElement  
     * @param  {jQuery} rightElement 
     * 
     * @return {None}              
     */
    switchElementsOnDom: function(leftElement, rightElement) {
      leftElement.insertAfter(rightElement);
    },
    
    /**
     * Switch two sortable elements by their internal index
     *
     * @function
     * @instance
     * 
     * @param  {Number} leftIndex  
     * @param  {Number} rightIndex 
     * 
     * @return {None}            
     */
    switchPositionsByIndex: function(leftIndex, rightIndex) {
      var positions = this.getSortablePositions(),
          temp      = positions[leftIndex].$el;

      positions[leftIndex].$el = positions[rightIndex].$el;
      positions[rightIndex].$el = temp;
    },
    
    /**
     * Cache the x,y coordinates and width,height of a sortable element
     *
     * @function
     * @instance
     * 
     * @param  {Object} dd Sortable definition
     * 
     * @return {None}    
     */
    cacheSortablePositions: function(dd) {
      var i         = 0,
          sortable  = null,
          position  = null,
          positions = null,
          elements  = null;

      if (this.getSortablePositions()) {
        positions = this.getSortablePositions();

        for (i = 0; i < positions.length; ++i) {
          sortable = positions[i].$el;
          _.extend(positions[i], sortable.offset());
        }
      } else {
        positions = [];
        elements = this.getSortableElements();

        for (i = 0; i < elements.length; ++i) {
          sortable = elements.eq(i);

          if (sortable.get(0) == dd.target) {
            sortable = dd.placeholder;
          }

          position        = sortable.offset();
          position.width  = sortable.width();
          position.height = sortable.height();
          position.$el    = sortable;
          positions.push(position);
        }

        this.setSortablePositions(positions);
      }
    },

    /**
     * When we are starting to sort something, we need to setup the element that we are sorting
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} el 
     * @param  {Object} dd The sortable definition
     * 
     * @return {None}    
     */
    setupDragElement: function(el, dd) {
      dd.oldZIndex = el.css('z-index');
      el.css({
        position  : 'absolute',
        'z-index' : 10000
      });
    },

    /**
     * Move the dragable element with the user' smouse
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} el 
     * @param  {Object} dd The sortable definition
     * 
     * @return {None}    
     */
    moveDragElement: function(el, dd) {
      var offset = this.$el.offset();
      el.css({
        top       : dd.offsetY-offset.top,
        left      : dd.offsetX-offset.left
      });
    },

    /**
     * When dragging has stopped, tear down the drag element and return it to its previous state
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} el 
     * @param  {Object} dd The sortable definition
     * 
     * @return {None}    
     */
    tearDownDragElement: function(el, dd) {
      el.css({
        top       : '',
        left      : '',
        position  : 'relative',
        'z-index' : dd.oldZIndex
      }).insertAfter(dd.placeholder);
      this.setSortablePositions(null);
      dd.placeholder.remove();
    },

    /**
     * Re-apply the sortable index to each element 
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    refreshDataSlotNumber: function() {
      var movableItems = this.$el.find(this.getElementSelector()),
          i            = 0;
      for (i = 0; i < movableItems.length; i++) {
        movableItems.eq(i).attr("data-slot-number",i);
      }
    },

    /**
     * Called when dragging has just started
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} el 
     * @param  {Object} dd The sortable definition
     * 
     * @return {None}    
     */
    dragDidStart: function(el, dd) {
      //save the cursor offsets
      if (!dd.cursorOffsetX || dd.cursorOffsetY) {
        dd.cursorOffsetX = dd.startX - dd.offsetX;
        dd.cursorOffsetY = dd.startY - dd.offsetY;
      }
      this.createPlaceholder(el,dd);
      this.setupDragElement(el, dd);
      this.cacheSortablePositions(dd);
    },

    /**
     * Called when a draggable has moved
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} el 
     * @param  {Object} dd The sortable definition
     * 
     * @return {None}    
     */
    elementDidMove: function(el, dd) {
      this.moveDragElement(el, dd);
      var currentHoverSpace = this.getCurrentHoverSpace(el, dd);
      if (currentHoverSpace >= 0 && dd.placeholderIndex != currentHoverSpace) {
        if (this.canDropInSpace(currentHoverSpace)) {
          this.didEnterNewDropSpace(el, currentHoverSpace, dd);
          dd.placeholderIndex = currentHoverSpace;
          this.cacheSortablePositions();
        }
      }
    },

    /**
     * Get which sortable slot an element is currently hovering over
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} el 
     * @param  {Object} dd The sortable definition
     * 
     * @return {Number}    
     */
    getCurrentHoverSpace: function(el, dd) {
      var positions = this.getSortablePositions(),
          x         = dd.offsetX + dd.cursorOffsetX,
          y         = dd.offsetY + dd.cursorOffsetY,
          i         = 0,
          p;

      for (i = 0; i < positions.length; i++) {
        p = positions[i];
        if (x > p.left && x <= p.left+p.width && y > p.top && y <= p.top+p.height) {
          return i;
        }
      }
      return -1;
    },


    /**
     * Can the currently dragged sortable be dropped in a particular sort index?
     *
     * @function
     * @instance
     * 
     * @param  {Number} spaceIndex 
     * 
     * @return {Boolean}            
     */
    canDropInSpace: function(spaceIndex) {
      var delegate = this.getDelegate();
      if (delegate && delegate.canDropSortableInSpace) {
        return delegate.canDropSortableInSpace(spaceIndex);
      }
      return true;
    },

    /**
     * Can the sortable at the specified index be dragged?
     *
     * @function
     * @instance
     * 
     * @param  {Number} spaceIndex
     * 
     * @return {Boolean}          
     */
    canDragElementAtIndex: function(spaceIndex) {
      var delegate = this.getDelegate();
      if (delegate && delegate.canDragSortableInSpace) {
        return delegate.canDragSortableInSpace(spaceIndex);
      }
      return true;
    },

    /**
     * The dragged element enter into a new sort position
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} el                
     * @param  {Number} currentHoverSpace The sort index that is being entered
     * @param  {Object} dd                The sortable definition
     * 
     * @return {None}                   
     */
    didEnterNewDropSpace: function(el, currentHoverSpace, dd) {
      var position = this.getSortablePositions()[currentHoverSpace],
          movingRight = null,
          delegate = this.getDelegate();
      if (position) {
        if (dd.placeholderIndex < currentHoverSpace) {
          this.switchElementsOnDom(dd.placeholder, position.$el);
          movingRight = true;
        } else {
          this.switchElementsOnDom(position.$el, dd.placeholder);
          movingRight = false;
        }
        this.switchPositionsByIndex(dd.placeholderIndex, currentHoverSpace);
        this.processPinnedSortables();
      }
      if (_.isFunction(delegate.sortableDragSwap)) {
        delegate.sortableDragSwap();
      }
    },

    /**
     * Look at all the elements and figure out how to make sure that pinned sortable items do not loose their original position
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    processPinnedSortables: function() {
      var i         = 0,
          positions = this.getSortablePositions(),
          nextIndex = null,
          nonPinned = [],
          pinned    = [],
          elements  = $(),
          el        = null,
          container = null;

      for (i = 0; i < positions.length; ++i) {
        el       = positions[i].$el;
        elements = elements.add(el);

        if (this.canDropInSpace(i)) {
          nonPinned.push(el);
        } else {
          pinned.push(el);
        }
      }

      if (pinned.length == 0) {
        return;
      }

      container = elements.eq(0).parent();
      elements.detach();

      for (i = 0; i < positions.length; ++i) {
        if (this.canDropInSpace(i)) {
          container.append(nonPinned.shift());
        } else {
          container.append(pinned.shift());
        }
      }
    },

    /**
     * Finds if there are any non-pinned positions after the given position.
     * Default to looking left to right.
     *
     * @function
     * @instance
     * 
     * @param  {Number} index   
     * @param  {Boolean} reverse Should we look from right to left?
     * 
     * @return {Number}         
     */
    findNextNonPinnedAfterIndex: function(index, reverse) {
      var i         = 0,
          position  = null,
          positions = this.getSortablePositions();

      for (i = index + 1; i < positions.length; ++i) {
        if (this.canDropInSpace(i)) {
          return i;
        }
      }
      return null;
    },
    
    /**
     * Called when dragging has finished
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} el 
     * @param  {Object} dd The sortable
     * 
     * @return {None}    
     */
    dragDidFinish: function(el, dd) {
      this.tearDownDragElement(el, dd);
    },

    /**
     * Handles the drag init event and will cancel it if the proper drag handle was not clicked on
     *
     * @function
     * @instance
     * 
     * @param  {Event} ev 
     * @param  {Object} dd The sortable definition
     * 
     * @return {Boolean}    
     */
    handleDragInit: function(ev, dd) {
      var el            = $(dd.target), 
          sortableIndex = Number(el.attr("data-slot-number")),
          grabbedOnHandle = $(ev.target).closest(".evisortable-drag-handle").length > 0;
      if (this.canDragElementAtIndex(sortableIndex) && grabbedOnHandle) {
        return undefined;
      } else {
        return true;
      }
    },

    /**
     * Scale an element down with animation
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} el 
     * 
     * @return {None}    
     */
    animateElementBegin: function(el) {
      $(el).animate({
        textIndent : 0.75,
        "margin-top" : "-=50"
      },
      {
        step : function(now, fx) {
          if (fx.prop == "textIndent") {
            $(this).css('-webkit-transform', 'scale(' + now + ')');
            $(this).css('-moz-transform', 'scale(' + now + ')');
            $(this).css('transform', 'scale(' + now + ')');
          } else {
            // Do Nothing... YET
          }
        },
        duration : 'fast'
      }, 'swing');
      el.get(0).isMini = true;
    },

    /**
     * Scale an element to its original size
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} el 
     * 
     * @return {None}    
     */
    animateElementEnd: function(el) {
      if (el.get(0).isMini) {
        el.get(0).isMini = false;
        $(el).stop().css("margin-top", "0px");
        $(el).animate({
          textIndent : 1
        }, {
          step : function(now, fx) {
            if(now > 0.75) {
              $(this).css('-webkit-transform', 'scale(' + now + ')');
              $(this).css('-moz-transform', 'scale(' + now + ')');
              $(this).css('transform', 'scale(' + now + ')');
            }
          },
          duration : 'fast'
        }, 'swing');
      }
    },

    /**
     * Handle the drag start event
     *
     * @function
     * @instance
     * 
     * @param  {Event} ev 
     * @param  {Object} dd The sortable definition
     * 
     * @return {None}    
     */
    handleDragStart: function(ev, dd) {
      var el = $(dd.target);
      this.dragDidStart(el, dd, ev);
      this.animateElementBegin(el);
    },

    /**
     * Handle the drag move event
     *
     * @function
     * @instance
     * 
     * @param  {Event} ev 
     * @param  {Object} dd The sortable definition
     * 
     * @return {None}    
     */
    handleDrag: function(ev, dd) {
      var el = $(dd.target);
      this.elementDidMove(el, dd, ev);
    },

    /**
     * Handle the drag end event
     *
     * @function
     * @instance
     * 
     * @param  {Event} ev 
     * @param  {jQuery} dd 
     * 
     * @return {None}    
     */
    handleDragEnd: function(ev, dd) {
      var el = $(dd.target),
      delegate = this.getDelegate();
      this.dragDidFinish(el, dd, ev);
      this.animateElementEnd(el);
      this.refreshDataSlotNumber();
      if (_.isFunction(delegate.sortableFinished)) {
        delegate.sortableFinished();
      }
    },

    /**
     * Create a placeholder for the element that is about to be dragged
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} el 
     * @param  {Object} dd The sortable definition
     * 
     * @return {NOne}    
     */
    createPlaceholder: function(el, dd) {
      var cssObj   = {},
          // getComputedStyle is a window function
          styleObj = getComputedStyle(el.get(0)),
          i        = 0;

      for (i = 0; i < styleObj.length; i++) {
        cssObj[styleObj[i]] = styleObj[styleObj[i]];
      }

      //need this line or else IE blows up.
      cssObj['float'] = el.css('float');

      dd.placeholder = $("<div>").css(cssObj)
        .css("visibility","false").width(el.width()).height(el.height()).addClass("evisortable-placeholder");

      dd.placeholderIndex = this.getSortableElements().index(el.get(0));
      el.before(dd.placeholder);
    }

  });
  return EVISortable;
});