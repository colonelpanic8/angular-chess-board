function monkeyPatch_mouseStart() {
  // don't really need this, but in case I did, I could store it
  // and chain
  var oldFn = $.ui.draggable.prototype._mouseStart ;
  $.ui.draggable.prototype._mouseStart = function(event) {
    var o = this.options;

    function getViewOffset(node) {
      var x = 0, y = 0, win = node.ownerDocument.defaultView || window;
      if (node) addOffset(node);
      return { left: x, top: y };

      function getStyle(node) {
        return node.currentStyle || // IE
        win.getComputedStyle(node, '');
      }

      function addOffset(node) {
        var p = node.offsetParent, style, X, Y;
        x += parseInt(node.offsetLeft, 10) || 0;
        y += parseInt(node.offsetTop, 10) || 0;

        if (p) {
          x -= parseInt(p.scrollLeft, 10) || 0;
          y -= parseInt(p.scrollTop, 10) || 0;

          if (p.nodeType == 1) {
            var parentStyle = getStyle(p)
            , localName   = p.localName
            , parent      = node.parentNode;
            if (parentStyle.position != 'static') {
              x += parseInt(parentStyle.borderLeftWidth, 10) || 0;
              y += parseInt(parentStyle.borderTopWidth, 10) || 0;

              if (localName == 'TABLE') {
                x += parseInt(parentStyle.paddingLeft, 10) || 0;
                y += parseInt(parentStyle.paddingTop, 10) || 0;
              }
              else if (localName == 'BODY') {
                style = getStyle(node);
                x += parseInt(style.marginLeft, 10) || 0;
                y += parseInt(style.marginTop, 10) || 0;
              }
            }
            else if (localName == 'BODY') {
              x += parseInt(parentStyle.borderLeftWidth, 10) || 0;
              y += parseInt(parentStyle.borderTopWidth, 10) || 0;
            }

            while (p != parent) {
              x -= parseInt(parent.scrollLeft, 10) || 0;
              y -= parseInt(parent.scrollTop, 10) || 0;
              parent = parent.parentNode;
            }
            addOffset(p);
          }
        }
        else {
          if (node.localName == 'BODY') {
            style = getStyle(node);
            x += parseInt(style.borderLeftWidth, 10) || 0;
            y += parseInt(style.borderTopWidth, 10) || 0;

            var htmlStyle = getStyle(node.parentNode);
            x -= parseInt(htmlStyle.paddingLeft, 10) || 0;
            y -= parseInt(htmlStyle.paddingTop, 10) || 0;
          }

          if ((X = node.scrollLeft)) x += parseInt(X, 10) || 0;
          if ((Y = node.scrollTop))  y += parseInt(Y, 10) || 0;
        }
      }
    }


    //Create and append the visible helper
    this.helper = this._createHelper(event);

    //Cache the helper size
    this._cacheHelperProportions();

    //If ddmanager is used for droppables, set the global
    //draggable
    if($.ui.ddmanager)
      $.ui.ddmanager.current = this;

    /*
     * - Position generation -
     * This block generates everything position related -
     it's the core of draggables.
    */

    //Cache the margins of the original element
    this._cacheMargins();

    //Store the helper's css position
    this.cssPosition = this.helper.css("position");
    this.scrollParent = this.helper.scrollParent();

    //The element's absolute position on the page minus
    //margins
    this.offset = this.positionAbs = getViewOffset(this.element[0]);
    this.offset = {
      top: this.offset.top - this.margins.top,
      left: this.offset.left - this.margins.left
    };

    $.extend(this.offset, {
      click: { //Where the click happened, relative to
        //the element
        left: event.pageX - this.offset.left,
        top: event.pageY - this.offset.top
      },
      parent: this._getParentOffset(),
      relative: this._getRelativeOffset() //This is a
      //relative to absolute position minus the actual
      //position calculation - only used for relative
      //positioned helper
    });

    //Generate the original position
    this.originalPosition = this.position = this._generatePosition(event);
    this.originalPageX = event.pageX;
    this.originalPageY = event.pageY;

    //Adjust the mouse offset relative to the helper if
    //'cursorAt' is supplied
    (o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

    //Set a containment if given in the options
    if(o.containment)
      this._setContainment();

    //Trigger event + callbacks
    if(this._trigger("start", event) === false) {
      this._clear();
      return false;
    }

    //Recache the helper size
    this._cacheHelperProportions();

    //Prepare the droppable offsets
    if ($.ui.ddmanager && !o.dropBehaviour)
      $.ui.ddmanager.prepareOffsets(this, event);

    this.helper.addClass("ui-draggable-dragging");
    //JWL: Hier vindt de jump plaats
    this._mouseDrag(event, true); //Execute the drag once
    //- this causes the helper not to be visible before getting its
    //correct position

    //If the ddmanager is used for droppables, inform the
    //manager that dragging has started (see #5003)
    if ( $.ui.ddmanager ) $.ui.ddmanager.dragStart(this, event);

    return true;

  };

}
monkeyPatch_mouseStart();
