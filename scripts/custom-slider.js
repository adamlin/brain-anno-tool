function centerslider(num){    
	if ($('#thumbnail-' + num).length > 0) {
        $('#gallery-thumbnail').scrollTo($('#thumbnail-' + num), {
            onAfter: function() {
                $('.lazy-load').lazyload({
                    container: $('#gallery-thumbnail'),
                    threshold: 200
                });
            },
            offset: function() { return {left: - $('#gallery-thumbnail').width() / 2 + 60}; }
        });
    } else {
        var target = $('.section-thumbnail[data-section-id=' + num + ']');
        if (target.length == 0) {
            target = $('.section-thumbnail').last();
        }
        $('#gallery-thumbnail').scrollTo(target, {
            onAfter: function() {
                $('.lazy-load').lazyload({
                    container: $('#gallery-thumbnail'),
                    threshold: 200
                });
            },
            offset: function() { return {left: - $('#gallery-thumbnail').width() / 2 + 60}; }
        });
    }
}


  /**
   * Renders a progress bar.
   * @param {Element} el The target element.
   * @constructor
   */
  function Progress(el) {
    this.el = el;
    this.loading = 0;
    this.loaded = 0;
  }


  /**
   * Increment the count of loading tiles.
   */
  Progress.prototype.addLoading = function() {
    if (this.loading === 0) {
      this.show();
    }
    ++this.loading;
    this.update();
  };


  /**
   * Increment the count of loaded tiles.
   */
  Progress.prototype.addLoaded = function() {
    var this_ = this;
    setTimeout(function() {
      ++this_.loaded;
      this_.update();
    }, 100);
  };


  /**
   * Update the progress bar.
   */
  Progress.prototype.update = function() {
    var width = (this.loaded / this.loading * 100).toFixed(1) + '%';
    this.el.style.width = width;
    if (this.loading === this.loaded) {
      this.loading = 0;
      this.loaded = 0;
      var this_ = this;
      setTimeout(function() {
        this_.hide();
      }, 500);
    }
  };


  /**
   * Show the progress bar.
   */
  Progress.prototype.show = function() {
    this.el.style.visibility = 'visible';
  };


  /**
   * Hide the progress bar.
   */
  Progress.prototype.hide = function() {
    if (this.loading === this.loaded) {
      this.el.style.visibility = 'hidden';
      this.el.style.width = 0;
    }
  };
      