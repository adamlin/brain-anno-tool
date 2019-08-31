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

//control left and right section by keydown
function  keydown_left_right(num, dir){
    var url = 'http://mitra.brain.riken.jp/openlayers/api/structure.php?brain=' + brain_id + '&tracer=' + label;
    $.getJSON(url, function(json) {
      if (num >=1){
        if(dir == 'left'){
          for(i = 0; i<= json.filestructure.length; i ++){
            if (json.filestructure[i].modeIndex == num){
              var pervious_section = replaceUrlParam(window.location.href, 'pid', json.filestructure[i-1].filename);
              window.location.href = pervious_section;
            }
          }
        }else{
         for(i = 0; i<= json.filestructure.length; i ++){
            if (json.filestructure[i].modeIndex == num){
              var pervious_section = replaceUrlParam(window.location.href, 'pid', json.filestructure[i+1].filename);
              window.location.href = pervious_section;
            }
          }
        }
      }else{
        var current_section = replaceUrlParam(window.location.href, 'pid', json.filestructure[num].filename);
        window.location.href = current_section;
      }
    });
}

function replaceUrlParam(url, paramName, paramValue){
    if(paramValue == null)
        paramValue = '';
    var pattern = new RegExp('\\b('+paramName+'=).*?(&|$)')
    if(url.search(pattern)>=0){
        return url.replace(pattern,'$1' + paramValue + '$2');
    }
    url = url.replace(/\?$/,'');
    return url + (url.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue 
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
      