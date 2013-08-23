define([
  'evisions/view', 
  'evisions/helper',
  'evisions/format',
  'library/moment'
], function(EVIView, helper, Format, moment) {
  /**
   * @class
   * @memberOf Evisions
   */
  var EVIGrid = EVIView.extend(/** @lends Evisions.EVIGrid */{

    properties: [
      'ColumnHeaderWrap',
      'ColumnWidths',
      'CurrentPage',
      'Columns',
      'LargeItemSupport',
      'Pages',
      'SelectedIndices',
      'SelectedMap',
      'ShowFooter'
    ],

    templates: {
      'init.evigrid'    : 'renderInitFragment',
      'cell.evigrid'     : 'renderCellFragment'
    },

    events: {
      'mousedown .grabber'   : 'handleGrabberMouseDown',
      'mousedown .gridRow'   : 'handleRowMouseDown',
      'mouseenter .gridRow'  : 'handleRowMouseEnter',
      'mouseleave .gridRow'  : 'handleRowMouseLeave',
      'click .column'        : 'handleColumnHeaderClick'
    },


    sortColumn    : null, //0, 1, 2, n-1 where n = # of columns
    sortDirection : null, //'asc' or 'desc'
    
    initialize: function(params) {
      this._super.apply(this, arguments);
      this.setShowFooter(params.Footer || false);
      this.setColumnHeaderWrap(params.ColumnHeaderWrap || false);
      this.handleMouseMove.proxied = this.handleMouseMove.proxy(this);
      this.handleMouseUp.proxied   = this.handleMouseUp.proxy(this);
      this.setCurrentPage(0);
      this.setPages([]);
      this.setSelectedMap([]);
      this.setSelectedIndices([]);
      this.MultiSelect= params.MultiSelect;

      this._formatCache = [];

      $(window)
        .on('mousemove', this.handleMouseMove.proxied)
        .on('mouseup',   this.handleMouseUp.proxied);
    },

    //renders the entire multicolumn list box, skeleton first, and then the items
    render: function() {
      var delegate          = this.getDelegate(),
           headerDefinition = this.getDelegate().getHeaderDefinition(),
                     params =  {
                        Headers: headerDefinition
                      }

      this.setColumns(headerDefinition);
      this.setColumnWidths(_.pluck(headerDefinition,'Width'));

      var mcEl = this.renderInitFragment(params);
      this.$el.append(mcEl);

      this.$('.rowContainer').scroll(this.handleGridScroll.proxy(this));

      if (this.getShowFooter()) {
        this.$el.children().eq(0).addClass("withFooter");
      }
      if (this.getColumnHeaderWrap()) {
        this.$el.children().eq(0).addClass("withColumnHeaderWrap");
      }
      _.defer(this.refreshColumnHeaders.proxy(this));

    },

    refreshColumnHeaders: function() {
      var hc         = this.$el.find('.headerContainer').height('auto'),
          rc         = this.$el.find('.rowContainer');
          height     = 10,
          totalWidth = 0,
          headers    = this.getColumns(),
          widths     = this.getColumnWidths() || [],
          i          = 0,
          len        = widths.length,
          columns    = hc.find(".column");
      //apply new sort icons - these icons may make text wrap, so we need to do it inside here
      columns
        .removeClass("ascSort")
        .removeClass("descSort");

      if (this.sortColumn) {
        columns
          .eq(this.sortColumn)
          .addClass(String(this.sortDirection) + "Sort");
      }

      for (i = 0; i < len; i++) {
        if (headers[i].Visible) {
          totalWidth += widths[i]+11; //1 for the grabber, 10 for 5 right and 5 left border
        }
      }
      
      this._totalHeaderWidth = totalWidth;

      hc.css('min-width', totalWidth);
      height = hc.height();

      //set the height to the height so the height is the height.  and not not the height.
      hc.height(height);
      rc.css('top',height);
      this.refreshPageColumnWidths(totalWidth);

    },


    refreshPageColumnWidths: function(pageWidth) {
      var pages        = this.getPages(),
          i            = 0,
          j            = 0,
          k            = 0,
          x            = 0,
          len          = pages.length,
          widths       = this.getColumnWidths(),
          pageChildren = null,
          page         = null,
          header       = this.getColumns(),
          curPage      = this.getCurrentPage(),
          nexPage      = curPage+1,
          prvPage      = curPage-1,
          updatePage   = null;

      updatePage = function(page) {
        $(page).css("min-width", pageWidth);
        page = page.childNodes;
        for (j = 0; j < page.length; j++) {
          x = 0;
          for (k = 0; k < header.length; k++) {
            if (header[k].Visible) {
              page[j].childNodes[x].style.width = widths[k] + "px";
              x++;
            }
          }
        }
      };

      if (pages[prvPage]) {
        updatePage(pages[prvPage]);
      }

      if (pages[curPage]) {
        updatePage(pages[curPage]);
      }

      if (pages[nexPage]) {
        updatePage(pages[nexPage]);
      }

    },

    clearNonVisiblePages: function() {
      var pages   = this.getPages(),
          i       = 0,
          len     = pages.length,
          curPage = this.getCurrentPage(),
          nexPage = curPage+1,
          prvPage = curPage-1;

      for (i = 0; i < len; ++i) {
        if (i > nexPage || i < prvPage) {
          this.deletePage(i);
        }
      }
    },

    //renders just new data
    refresh: function(selectedIndices) {
      this.clearCache();
      this.setupGridElement();
      if (selectedIndices && selectedIndices.length) {
        this.setSelectedIndices(selectedIndices, true);
        for (var i  = 0; i < selectedIndices.length; ++i) {
          this.getSelectedMap()[selectedIndices[i]] = true;
        }
      }
      this.draw();
      this.updateFooter();
    },

    selectItemsAtIndices: function(indices) {
      indices = indices || [];

      for (i = 0; i < indices; ++i) {
        this.selectItem(indices[i]);
      }

      this.setSelectedIndices(indices);
    },

    unselectAll: function() {
      var indices = this.getSelectedIndices() || [],
          i       = 0,
          len = indices.length;

      for (i = 0; i < len; ++i) {
        this.unselectItem(indices[i]);
      }
    },

    selectRange: function(start, end, forceSelect) {
      var i           = start,
          add         = start <= end ? 1 : -1,
          lastItem    = false,
          multiSelect = !!this.MultiSelect,
          lastIndex   = end+add;

      while (i != lastIndex) {

       lastItem = (i == end+(add*2));

       if (multiSelect) {
          if (forceSelect) {
            this.selectItem(i, true);
          } else {
            this.toggleSelection(i, true);
            console.log("here");
          }
        } else {
          if (lastItem) {
            this.selectItem(i, true);
          } else {
            this.unselectItem(i, true);
          }
        }

        i += add;
      }
    },

    unselectRange: function(start, end) {
      var i = start;

      while (i < end+1) {
        this.unselectItem(i);
        ++i;
      }
    },

    toggleSelection: function(index, noUpdate) {
      var selectedMap = this.getSelectedMap();

      if (selectedMap[index]) {
        this.unselectItem(index, noUpdate);
      } else {
        this.selectItem(index, noUpdate);
      }
    },

    selectItem: function(index, noUpdate) {
      var pages       = this.getPages(),
          itemsInPage = this.getItemsInChunk(),
          pageNumber  = Math.floor(index/itemsInPage),
          indexInPage = index % itemsInPage;

      if (pages[pageNumber] != null) {
        $(pages[pageNumber]).find('.gridRow').eq(indexInPage).addClass('selected');
      }

      if (noUpdate !== true) {
        this.getSelectedMap()[index] = true;
      } else {

        var tempSelectedMap = this._tempSelectedMap || (this._tempSelectedMap = []),
            tempSelectedItems = this._tempSelectedItems || (this._tempSelectedItems = []);

        if (!tempSelectedMap[index]) {
          tempSelectedItems.push(index);
          tempSelectedMap[index] = true;
        }
      }
    },

    unselectItem: function(index, noUpdate) {
      var pages       = this.getPages(),
          itemsInPage = this.getItemsInChunk(),
          pageNumber  = Math.floor(index/itemsInPage),
          indexInPage = index % itemsInPage;

      if (pages[pageNumber] != null) {
        $(pages[pageNumber]).find('.gridRow').eq(indexInPage).removeClass('selected');
      }

      if (noUpdate !== true) {
        this.getSelectedMap()[index] = null;
      } else {
        var tempSelectedMap = this._tempSelectedMap || (this._tempSelectedMap = []),
            tempSelectedItems = this._tempSelectedItems || (this._tempSelectedItems = []);

        if (tempSelectedMap[index]) {
          this._tempSelectedItems = _.without(tempSelectedItems, index);
          tempSelectedMap[index] = null;
        }
      }
    },

    isSelectedAtIndex: function(index) {
      var selectedMap     = this.getSelectedMap(),
          tempSelectedMap = this._tempSelectedMap || {};

      return selectedMap[index] || tempSelectedMap[index];
    },

    setupGridElement: function() {
      var rowContainer = this.$('.rowContainer').empty(),
          spacerTop    = $('<div class="spacer" />')
          spacerBottom = $('<div class="spacer" />')

      rowContainer.append(spacerTop).append(spacerBottom);

      this._spacerTop    = spacerTop;
      this._spacerBottom = spacerBottom;

    },

    clearCache: function() {
      this.setPages([]);
      this.setSelectedIndices([], true);
      this.setSelectedMap([]);
      this._headerContainer = null;
      this._spacerBottom    = null;
      this._spacerTop       = null;
      this._lastChunkItems  = null;
      this._formatCache     = [];
    },

    draw: function() {
      var currentPage   = this.getCurrentPage(),
          count         = this.getItemCount()
          previousPage  = this._previousPage || 0,
          rowHeight     = this.calculateRowHeight(),
          itemsInChunk  = this.getItemsInChunk(),
          pageCount     = this.getPageCount(),
          beforeMargin  = (currentPage ? currentPage-1 : 0) * rowHeight * itemsInChunk,
          // minus three because pageCount-1 is the highest page index, currentPage+1 is the highest rendered page, 
          // and we dont want to include the very last page in the margin, so -1 for that as well
          lastChunkItms = this._lastChunkItems || (count % itemsInChunk || itemsInChunk),
          afterMargin   = rowHeight * ((pageCount - currentPage - 3) * itemsInChunk + lastChunkItms);

      if (previousPage-1 < currentPage-1 || previousPage-1 > currentPage+1) {
        this.hidePage(previousPage-1);
      }

      if (previousPage < currentPage-1 || previousPage > currentPage+1) {
        this.hidePage(previousPage);
      }

      if (previousPage+1 < currentPage-1 || previousPage+1 > currentPage+1) {
        this.hidePage(previousPage+1);
      }

      this._spacerTop.height(beforeMargin);

      this._spacerBottom.height(afterMargin);

      this.showPage(currentPage-1);
      this.showPage(currentPage);
      this.showPage(currentPage+1);
      if (!this._lastChunkItems)
        this._lastChunkItems = lastChunkItms;
      
    },

    setHeaderScroll: function(scroll) {
      var headerContainer = this._headerContainer || (this._headerContainer = this.$('.headerContainer'));

      headerContainer.get(0).style.left = (-scroll) + 'px';
    },

    didScrollToPage: function(page) {
      var currentPage = this.getCurrentPage();

      if (page != currentPage) {
        this.setCurrentPage(page);
        this._previousPage = currentPage;
        this.draw();
      }
    },

    showPage: function(page) {
      var pages = this.getPages(),
          pageEl = null;

      // Add sanity check
      if (page < 0 || page >= this.getPageCount()) {
        return;
      }

      if (pages[page] != null) {
        pages[page].style.display = 'block';
      } else {
        pageEl = this.renderPage(page);
        this.insertPageAtIndex(page, pageEl.get(0));
      }

    },

    deletePage: function(page) {
      var pages = this.getPages();
         pageEl = pages[page];

      if (pages[page] != null) {
        pageEl.parentNode.removeChild(pageEl);
        pages[page] = null;
      }
    },


    hidePage: function(page) {
      var pages = this.getPages();

      if (pages[page]) {
        pages[page].style.display = 'none';
      }
    },

    /**
     * Take a page index and a dom element that is only in memory and insert it correctly on the DOM
     * 
     * @param  {Integer} page The page index we want to insert at
     * @param  {Element} el   The element we want to insert on the DOM
     */
    insertPageAtIndex: function(page, el) {
      var pages = this.getPages(),
          count = this.getPageCount(),
          i     = 0;

      // // No pages have been added so we just append it to the container
      // if (pages[0] == null) {

      //   return;
      // }

      if (page < count/2) {
        //If the page we are looking at is < half then search toward the first index
        for (i = page-1; i >= 0; --i) {
          if (pages[i] != null) {
            pages[i].parentNode.insertBefore(el, pages[i].nextSibling);
            pages[page] = el;
            return;
          }
        }
        this._spacerTop.get(0).parentNode.insertBefore(el, this._spacerTop.get(0).nextSibling);
        pages[page] = el;
        // If we got this far then something is seriously wrong
        return;
      } else {
        //If the page we are looking at is >= half then search toward the last index
        for (i = page; i < count; ++i) {
          if (pages[i] != null) {
            pages[i].parentNode.insertBefore(el, pages[i]);
            pages[page] = el;
            return;
          }
        }
        // If we have gotten here then we reached the bottom and nothing was found.
        // Thus we just insert before the spacer
        this._spacerBottom.get(0).parentNode.insertBefore(el, this._spacerBottom.get(0));
        pages[page] = el;
      }
    },

    renderPage: function(page) {
      var itemsInPage = this.getItemsInChunk(),
          start       = page * itemsInPage,
          end         = start + itemsInPage;

      return this.renderChunk(start, end, page);
    },

    renderChunk: function(start, end, pageIndex) {
      var data         = this.getItemSlice(start, end),
          itemsInChunk = this.getItemsInChunk(),
          i            = 0,
          len          = data ? data.length : 0,
          row          = null,
          chunk        = null;

      chunk = $('<div data-index="'+pageIndex+'" class="chunk" style="min-width:' +  (this._totalHeaderWidth || 'auto') + 'px;"/>');

      for (i = 0; i < len; ++i) {
        //MERGE - used to be  (pageIndex*itemsInChunk) + i, changed to start
        chunk.append(this.renderRow(data[i], i+start));
      }

      return chunk;
    },

    renderRow: function(data, rowIndex) {
      var i            = 0,
          len          = data ? data.length : 0,
          columnWidths = this.getColumnWidths(),
          columns      = this.getColumns(),
          column       = null,
          cell         = {},
          row          = $('<div class="gridRow" />').attr('data-index', rowIndex),
          text         = null;

      if (!this._formatCache[rowIndex])
        this._formatCache[rowIndex] = [];

      if (this.isSelectedAtIndex(rowIndex)) {
        row.addClass('selected');
      }

      for (i = 0; i < len; ++i) {
        column = columns[i];
        if (column && column.Visible) {
          text = this._formatCache[rowIndex][i] || this.formatCell(data[i], column.DisplayFormat ,rowIndex,i, column.Type);
          cell = {
            Text: text,
            Width: columnWidths[i] || 20
          };
          row.append(this.renderCell(cell, i, column));
        }
      }

      row.append('<div class="clear"></div>');
      return row;
    },

    formatCell: function(data, format, rowIndex, columnIndex, type) {
      var temp = this.formatData(data, format, type);
      this._formatCache[rowIndex][columnIndex] = temp;
      return temp;
    },

    formatData: function(data, format, type) {
      return data;
    },

    renderCell: function(cell, index) {
      return this.renderCellFragment(cell);
    },

    setColumnWidthAtIndex: function(index, width) {
      this.ColumnWidths[index] = width;
      this.refreshColumnHeaders();
      this.$el.find('.headerContainer .column').eq(index).width(width);
    },

    getColumnWidthAtIndex: function(index) {
      return this.ColumnWidths[index];
    },

    handleColumnHeaderClick: function(ev) {
      var colIndex = $(ev.currentTarget).attr("colindex");
      if (this.sortColumn == colIndex) {
        if (this.sortDirection == 'desc') {
          this.sortColumn = null;
          this.sortDirection = null;
        } else {
          this.sortDirection = 'desc';
        }
      } else {
        this.sortColumn = colIndex;
        this.sortDirection = 'asc';
      }
      if (this.getDelegate().sortingDidChange) {
        this.getDelegate().sortingDidChange(this.sortColumn, this.sortDirection);
      }
      this.refreshColumnHeaders();
    },

    handleGridScroll: function(ev) {
      // var scrollTop = $(ev.currentTarget).scrollTop();
      var scrollTop  = ev.currentTarget.scrollTop,
          scrollLeft = ev.currentTarget.scrollLeft,
          page       = Math.round(scrollTop / (this.getItemsInChunk() * this.calculateRowHeight()));

      this.setHeaderScroll(scrollLeft);
      this.didScrollToPage(page);
    },


    getViewportSize: function() {
      return this.$('.rowContainer').height();
    },

    fetchCurrentChunk: function() {
      var sliceStart = this.getChunkStart(),
            sliceEnd = this.getItemsInChunk() + sliceStart;
    },

    getPageCount: function() {
      return Math.ceil(this.getItemCount() / this.getItemsInChunk());
    },

    //a chunk is all the elements that can be rendered at a time
    getItemsInChunk: function() {
      if (this.getLargeItemSupport) {
        //lets only render 3 times the amount of items that the user can see
        return Math.ceil(this.getViewportSize() / this.calculateRowHeight());
      } else {
        return this.getItemCount();
      }
    },

    calculateRowHeight: function() {
      if (this._cachedRowHeight) {
        return this._cachedRowHeight;
      }

      var container = this.$(".rowContainer"),
          row       = $('<div class="gridRow" style="visibility: hidden;"/>'),
          col       = $('<div class="gridCol" />');

      col.text('test text');
      row.append(col);
      row.append('<div class="clear" />');
      container.append(row);

      this._cachedRowHeight = row.height();

      row.remove();

      return this._cachedRowHeight;
    },

    getItemCount: function() {
      return this.getDelegate().requestItemCount()
    },

    getItemSlice: function(startIndex, endIndex) {
      return this.getDelegate().requestItemSlice(startIndex, endIndex);
    },

    updateFooter: function() {
      var textEl   = this.$('.footerContainer .text'),
          selected = this.getSelectedIndices(),
          count    = this.getItemCount(),
          text     = '';

      text += helper.formatNumber(count);

      if (count == 1) {
        text += ' item';
      } else {
        text += ' items'
      }

      if (selected.length) {
        text += ', ' + helper.formatNumber(selected.length) + ' selected';
      }

      textEl.text(text);
    },

    setupScroll: function() {
      helper.setupScroll(this.$el);
    },

    updateScroll: function() {
      helper.updateScroll(this.$el);
    },

    handleGrabberMouseDown: function(ev) {
      this._resizeColumnIndex = $(ev.currentTarget).attr('colIndex');
      this._resizeMouseStart = ev.clientX;
      this.clearNonVisiblePages();
      this._resizeColumnWidth = this.getColumnWidthAtIndex(this._resizeColumnIndex);
      this._reszieColumnFlag = true;
    },

    handleMouseMove: function(ev) {
      if (this._reszieColumnFlag) {
        var newWidth = this._resizeColumnWidth + (ev.clientX - this._resizeMouseStart);
        this.setColumnWidthAtIndex(this._resizeColumnIndex, newWidth);
      }

    },

    handleRowMouseLeave: function(ev) {
      var el              = ev.currentTarget,
          selectedMap     = this.getSelectedMap(),
          tempSelectedMap = this._tempSelectedMap || {},
          index           = 0;

      if (this._rowMouseDownEl && el  !== this._rowMouseDownEl) {
        index = Number(el.attributes['data-index'].value);
        if (index != this._rowMouseDownIndex && ((index > this._rowMouseDownIndex && index <= this._previousMouseEnterIndex) || (index < this._rowMouseDownIndex && index >= this._previousMouseEnterIndex))) {
          // By getting here we need to deselect something
          if (selectedMap[index]) {
            this.selectItem(index, true);
          } else {
            this.unselectItem(index, true);
          }
        }
      }
    },

    handleRowMouseEnter: function(ev) {
      var el              = ev.currentTarget,
          index           = 0;

      if (this._rowMouseDownEl && el  !== this._rowMouseDownEl) {
        index = Number(el.attributes['data-index'].value);
        this._previousMouseEnterIndex = index;
        this.selectRange(this._rowMouseDownIndex, index);
      }
    },

    handleRowMouseDown: function(ev) {
      var el           = ev.currentTarget,
          ctrlPressed  = ev.ctrlKey && this.MultiSelect,
          shiftPressed = ev.shiftKey && this.MultiSelect,
          i            = 0,
          len          = 0,
          index        = Number(el.attributes['data-index'].value);

      if (!ctrlPressed && !shiftPressed) {
        this.unselectAll();
      } else {
        var selectedIndices = this.getSelectedIndices(),
            len             = selectedIndices.length;

        if (!shiftPressed || this._previousMouseUpIndex == index) {
          for (i = 0; i < len; ++i) {
            this.selectItem(selectedIndices[i], true);
          }
        } else {
          this.unselectAll();
        }
      }

      this.setSelectedIndices([]);

      if (ctrlPressed) {
        this.toggleSelection(index, true);
      } else if (shiftPressed && this._previousMouseUpIndex != null) {
        this.selectRange(index, this._previousMouseUpIndex, true);
        this.selectItem(index, true);
        this.selectItem(this._previousMouseUpIndex, true);
      } else {
        this.selectItem(index, true);
      }


      this._rowMouseDownEl   = el;
      this._rowMouseDownIndex = index;
    },

    handleMouseUp: function(ev) {
      this._reszieColumnFlag = false;

      if (this._rowMouseDownEl) {
        this.setSelectedMap(this._tempSelectedMap);
        this.setSelectedIndices(this._tempSelectedItems);
      }

      if (!ev.shiftKey || this._previousMouseUpIndex == null) {
        this._previousMouseUpIndex = this._previousMouseEnterIndex != null ? this._previousMouseEnterIndex : this._rowMouseDownIndex;
      }

      this._rowMouseDownEl = null;
      this._tempSelectedItems = null;
      this._tempSelectedMap = null;
      this._previousMouseEnterIndex = null;
      this._rowMouseDownIndex = null;
    },

    handleGridClick: function(ev) {
      var index = Number($(ev.currentTarget).attr('data-index'));


      if (!_.isNaN(index)) {
        this.didSelectItemAtIndex(index);
      }
    },

    unload: function() {
      $(window)
        .off('mousemove', this.handleMouseMove.proxied)
        .off('mouseup',   this.handleMouseUp.proxied);

      helper.destroyScroll(this.$el);
      return this._super();
    }

  });
  return EVIGrid;
});