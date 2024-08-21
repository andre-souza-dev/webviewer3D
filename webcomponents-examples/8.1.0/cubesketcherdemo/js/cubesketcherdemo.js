'use strict';

(function () {
  var $ = jQuery;

  function CubeSketcherDemo() {
    this._cubeSketcher;
    this._indexBrowsing;
    this._scrollPagingEnabled = false;
    this._offset = 0;
    this._limit = 25;
    this._prefetchRows = 2;
    this._searchData;
    this._$cubeContainer = $('.cubesketcherSketchContainer');
    this._$indexContainer = $('.cubesketcherSearchResult');
  }

  CubeSketcherDemo.prototype.init = function () {

    //psol.core.setServiceBaseUrl('https://mobileapps.partcommunity.com');
    this._progressHandler = psol.components.ProgressHandler;

    this._cubeSketcher = new psol.components.CubeSketcher({
      $container: this._$cubeContainer,
      showSearchOptions: true,
      minResultQuality: 87
    });
    this._cubeSketcher.onsearch = function (imageData) {
      imageData.geosearch = {
        top: imageData.top,
        front: imageData.front,
        side: imageData.side,
        offset: this._offset,
        limit: this._limit
      };
      this._indexBrowsing = new psol.components.IndexBrowsing({
        $container: this._$indexContainer
      });
      this._indexBrowsing.show().done(function () {
        $('.psol-comp-index-scroll-container').on('scroll', this._onScroll.bind(this));
      }.bind(this));
      this.search(imageData);
    }.bind(this);
    $('.backButton').on('click', function onBackButton() {
      this._$cubeContainer.css('display', 'block');
      $('.cubesketcherSearchContainer').css('display', 'none');
      this._indexBrowsing = null;
      this._setTitle(psol.translation.zTR('CubeSketcher Demo'));
    }.bind(this));
    this._cubeSketcher.show();
    this.setUpProgressHandler();
  };

  CubeSketcherDemo.prototype.setUpProgressHandler = function () {
    this._progressHandler.onProgressBegin = function (progressEvent) {
      psol.components.ProgressDialog.show(progressEvent);
    };
    this._progressHandler.onProgressEnd = function (progressEvent) {
      psol.components.ProgressDialog.hide(progressEvent);
    };
  };

  CubeSketcherDemo.prototype._setTitle = function (title) {
    title = title.trim();
    $('.title').html(title);
  };

  CubeSketcherDemo.prototype._navigateTo = function (path) {
    if (path) {
      var aPaths = path.split('/');
      aPaths.pop();
      var i = 0;

      psol.index.getNodeInfoAsync({
        path: aPaths.join('/')
      }).done(function (node) {
        var indexNode;
        if (node && node.index && node.index.nodes) {
          for (i = 0; i < node.index.nodes.length; i++) {
            indexNode = node.index.nodes[i];
            if (indexNode.path === path) {
              this._indexBrowsing.onNodeClicked({
                indexNode: indexNode
              });
            }
          }
        }
      }.bind(this));
    }
  };

  CubeSketcherDemo.prototype._getItems = function (data, append) {
    data = data || {};
    data = $.extend(true, {
      limit: this._limit,
      user: true
    }, data);
    this._lastData = data;

    return this._indexBrowsing.loadByPath(data, append).done(function (data) {
      if (data.count !== 0) {
        this._$indexContainer.show();
        this._offset += this._limit;
        if (data.count > this._offset + this._limit) {
          this._scrollPagingEnabled = true;
        }
      }
    }.bind(this));
  };

  CubeSketcherDemo.prototype._onScroll = function (e) {
    if (this._scrollPagingEnabled) {
      var $target = $(e.currentTarget);
      var $node = $('.psol-comp-index-item:first');
      var $nodeContainer = $('.psol-comp-index-node-list');
      var prefetch = $node.outerHeight(true) * this._prefetchRows;

      if ($target.scrollTop() >= ($nodeContainer.outerHeight(true) - $target.height() - prefetch)) {
        this._scrollPagingEnabled = false;
        var requestData = this._lastData || {
          limit: 25,
          user: true
        };
        requestData.offset = this._offset;
        if (this._searchData.offset > 0) {
          this.search(this._searchData);
        } else {
          this._getItems(requestData, true);
        }
      }
    }
  };

  CubeSketcherDemo.prototype.search = function (options) {
    var searchData = {
      num: 25,
      top: options.top.replace('data:image/png;base64,', ''),
      front: options.front.replace('data:image/png;base64,', ''),
      side: options.side.replace('data:image/png;base64,', ''),
      quality: options.quality || 70,
      offset: options.offset || 0,
      limit: options.limit || 25
    };
    this._searchData = $.extend(true, this._searchData, searchData);
    var progressEvt = new psol.components.ProgressEvent(psol.translation.zTR('Bitte warten...'), psol.translation.zTR('Bauteile werden gesucht...'));
    this._progressHandler.onProgressBegin(progressEvt);
    return psol.geoSearch.startSketchSearchAsync(this._searchData).done(function (result) {
      if (options.top.includes('data:image/png;base64,')) {
        $('.front')[0].src = options.front;
        $('.top')[0].src = options.top;
        $('.side')[0].src = options.side;
      }

      this._$cubeContainer.css('display', 'none');
      $('.cubesketcherSearchContainer').css('display', 'block');
      this._setTitle(psol.translation.zTR('Suchergebnisse'));
      if (result.index.nodes.length === 0) {
        //Handle no results here
        var msg = new psol.components.MessageDialog({
          title: psol.translation.zTR('Ihre Suchanfrage lieferte keine Ergebnisse'),
          message: psol.translation.zTR('Keine Ergebnisse bei einer Ähnlichkeit von %1% gefunden.', searchData.quality)
        });
        msg.show();
      } else {
        //handle results here
        var append = result.offset > 0;
        if (!append) {
          $('.psol-comp-index-scroll-container').scrollTop(0);
        }
        this._searchData.offset += this._searchData.limit;
        this._indexBrowsing.loadByIndexNodes(result.index.nodes, append, {
          showCatalogImages: false
        }).done(function () {
          this._offset += this._limit;
          if (result.has_more || (result.count > this._offset + this._limit)) {
            this._scrollPagingEnabled = true;
          }
          this._$indexContainer.show();
        }.bind(this));
      }
      this._progressHandler.onProgressEnd(progressEvt);
    }.bind(this));
  };

  $(document).ready(function () {
    var cubeDemo = new CubeSketcherDemo();
    cubeDemo.init();
  });
}());
