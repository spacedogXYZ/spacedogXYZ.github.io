/**
 * $.disableScroll
 * Author: Josh Harrison - aloofdesign.com
 *
 * Disables scroll events from mousewheels, touchmoves and keypresses.
 * Use while jQuery is animating the scroll position for a guaranteed super-smooth ride!
 *
 * minor changes by @jlev to allow release after defined number of iterations
 */

;(function($) {

  "use strict";


  // Privates

  var instance;
  var scrollPast = 0;

  var _handleKeydown = function(event) {
    for (var i = 0; i < this.opts.scrollEventKeys.length; i++) {
      if (event.keyCode === this.opts.scrollEventKeys[i]) {
        scrollPast += 10; //these events are more infrequent
        if (this.opts.releaseAfter && scrollPast >= this.opts.releaseAfter) {
          scrollPast = 0;
          if (this.opts.doAfter) {
            this.opts.doAfter.call(this);
          }
          return true;
        } else {
          event.preventDefault();
          return false;
        }
      }
    }
  };

  var _handleWheel = function(event) {
    scrollPast += 1;
    if (this.opts.releaseAfter && scrollPast >= this.opts.releaseAfter) {
      scrollPast = 0;
      if (this.opts.doAfter) {
        this.opts.doAfter.call(this);
      }
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  };

  
  // The object

  function UserScrollDisabler($container, options) {

    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    // left: 37, up: 38, right: 39, down: 40
    this.opts = $.extend({
      handleKeys : true,
      scrollEventKeys : [32, 33, 34, 35, 36, 37, 38, 39, 40],
      releaseAfter: false,
      callback: undefined
    }, options);

    this.$container = $container;
    this.$document = $(document);

    this.disable();

  }
  UserScrollDisabler.prototype = {
    
    disable : function() {
      var t = this;
      t.$container.on("mousewheel.UserScrollDisabler DOMMouseScroll.UserScrollDisabler touchmove.UserScrollDisabler", function(event) {
        _handleWheel.call(t, event);
      });

      if(t.opts.handleKeys) {
        t.$document.on("keydown.UserScrollDisabler", function(event) {
          _handleKeydown.call(t, event);
        });
      }
    },
    
    undo : function() {
      var t = this;
      t.$container.off(".UserScrollDisabler");
      if(t.opts.handleKeys) {
        t.$document.off(".UserScrollDisabler");
      }
    }
    
  };


  // Plugin wrapper for object

  $.fn.disableScroll = function(method) {

    // If calling for the first time, instantiate the object and cache in this closure.
    // Plugin can therefore only be instantiated once per page.
    // Can pass options object in through the method parameter.
    if( ! instance && (typeof method === "object" || ! method)) {
      instance = new UserScrollDisabler(this, method); // this = jquery collection to act on = $(window), hopefully!
    }

    // Instance already created, and a method is being explicitly called, e.g. .disablescroll('undo');
    else if(instance && instance[method]) {
      instance[method].call(instance);
    }

    // No method called explicitly, so assume 'disable' is intended.
    // E.g. calling .disablescroll(); again after a prior instantiation and undo.
    else if(instance) {
      instance.disable.call(instance);
    }

  };

})(jQuery);