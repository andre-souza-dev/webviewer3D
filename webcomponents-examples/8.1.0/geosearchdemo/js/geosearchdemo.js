/* eslint-disable no-console */
'use strict';

(function () {

  var $ = jQuery;


  function GeoSearchDemo() {
    this._myfile;
    this._geosearch;
    this._result;
    this._quality = 70;
    this._searchtext;
    this._$indexContainer = $('.indexComponentContainer');
    this._indexBrowsing = undefined;
    this._tableComponent;
    this._progressHandler = psol.components.ProgressHandler;
    this._stack = [];
    this._erpEnabled = true;
    this._filter = '';
  }

  GeoSearchDemo.prototype.init = function () {
    var initPromise = $.Deferred();

    psol.erp.isErpEnabled()
      .done(function (erpEnabled) {
        if (erpEnabled) {
          this._erpEnabled = true;
          // TODO: hard coded login and role
          psol.erp.setUserData('erpuser', '');
          psol.erp.login()
            .done(function () {
              psol.erp.selectGroup('Admin').done(function () {
                psol.erp.setFiltersEnabled(false);
                initPromise.resolve();
              });
            })
            .fail(function () {
              console.error('login failed!');
              initPromise.reject('login failed');
            });
        } else {
          initPromise.resolve();
        }
      })
      .fail(function () {
        initPromise.resolve();
      });

    $('#file1').on('change', function (e) {
      this._myfile = e.currentTarget.files[0];
    }.bind(this));


    $('#searchtext').on('change', function (e) {
      this._searchtext = $(e.currentTarget).val();
    }.bind(this));

    $('#startGeoSearch').on('click', function (e) {
      console.log(e.type);
      this._startGeoSearch();
    }.bind(this));

    $('#startTextSearch').on('click', function (e) {
      console.log(e.type);
      this._startTextSearch();
    }.bind(this));

    $(document).on('keypress', function (e) {
      if (e.which === 13) {
        console.log(e.type);
        this._searchtext = $('#searchtext').val();
        this._startTextSearch();
      }
    }.bind(this));

    // load a path to the index component
    this._stack.push({
      path: '/',
      scrollPos: 0,
      name: psol.translation.zTR('Suchergebnis'),
      type: 'DIR'
    });
    this._setTitle(psol.translation.zTR('Suchergebnis'));
    return initPromise.promise();
  };

  function TabCtrl(container, tabs) {
    this.container = container;
    this.tabs = tabs;
    this.pages = undefined;
    this.activePage = undefined;
  }

  TabCtrl.prototype.setActiveTab = function (name) {
    this.activePage.removeClass('active');
    this.activePage = this.container.find('.tabCtrlPage[data-name="' + name + '"]').addClass('active');
  };

  TabCtrl.prototype.init = function () {

    var that = this;
    that.pages = that.container.find('.tabCtrlPage');
    var menuEntries = that.container.find('.tabCtrlMenu li');
    var i;
    var menuEntry;
    var tab;
    for (i = 0; i < menuEntries.length; ++i) {
      menuEntry = $(menuEntries[i]);
      tab = that.tabs[menuEntry.data('name')];
      // set header with
      menuEntry.width(100 / menuEntries.length + '%');
      // set header text
      if (tab) {
        menuEntry.html(tab.title);
      }
    }

    that.activePage = that.pages.find('.active');
    if (that.activePage.length === 0) {
      that.activePage = $(that.pages[0]).addClass('active');
    }


    // event handlerf
    menuEntries.on('click', function (event) {
      menuEntries.removeClass('active');
      $(event.currentTarget).addClass('active');
      if ($(event.currentTarget).data('name') !== that.activePage.data('name')) {
        that.tabs[$(event.currentTarget).data('name')].view.show();
        that.tabs[that.activePage.data('name')].view.hide();

        that.activePage.removeClass('active');
        var newPageName = $(event.currentTarget).data('name');
        that.activePage = that.container.find('.tabCtrlPage[data-name="' + newPageName + '"]');
        that.activePage.addClass('active');
      }
    });
  };

  GeoSearchDemo.prototype.setUpProgressHandler = function () {
    this._progressHandler.onProgressBegin = function (progressEvent) {
      psol.components.ProgressDialog.show(progressEvent);
    };
    this._progressHandler.onProgressEnd = function (progressEvent) {
      psol.components.ProgressDialog.hide(progressEvent);
    };
  };

  GeoSearchDemo.prototype._setTitle = function (title) {
    title = title.trim();
    $('.title').html(title);
  };

  GeoSearchDemo.prototype._showDocument = function (docPath) {
    var url = new psol.thirdparty.URI(docPath);
    if (url.is('relative')) {
      docPath = psol.core.getServiceBaseUrl() + '/23d-libs/' + docPath;
    }

    window.open(docPath, '_blank');
  };

  /*
  GeoSearchDemo.prototype._updateHistory = function (indexNode) {
    if (window.history && window.history.pushState) {
      var title = indexNode.nn_name || indexNode.name;
      window.history.pushState(title, title, (window.location.href.split('?'))[0] + '?path=' + encodeURIComponent(indexNode.path));
    }
  };
  */

  GeoSearchDemo.prototype._startGeoSearch = function () {
    var progressEvt = new psol.components.ProgressEvent(psol.translation.zTR('Bitte warten...'), psol.translation.zTR('Bauteile werden gesucht...'));
    this._progressHandler.onProgressBegin(progressEvt);

    psol.geoSearch.startGeoSearchByFileAsync({
      num: 25,
      file: this._myfile,
      filename: this._myfile.name,
      quality: this._quality,
      template: 'SystemTemplate1',
      resultType: 'lines',
      details: 1
    }).done(function (result) {
      if (result.index.nodes.length === 0) {
        //Handle no results here
        var msg = new psol.components.MessageDialog({
          title: 'Ihre Suchanfrage lieferte keine Ergebnisse',
          message: 'Keine Ergebnisse bei einer Ähnlichkeit von ' + this._quality + ' gefunden.'
        });
        msg.show();
      } else {
        //handle results here
        var append = result.offset > 0;
        if (!append) {
          $('.psol-comp-index-scroll-container').scrollTop(0);
        }
        //geoSearch._searchData.offset += geoSearch._searchData.limit;
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

  GeoSearchDemo.prototype._startTextSearch = function () {
    var progressEvt = new psol.components.ProgressEvent(psol.translation.zTR('Bitte warten...'), psol.translation.zTR('Bauteile werden gesucht...'));
    this._progressHandler.onProgressBegin(progressEvt);

    psol.search.startFullTextSearchAsync({
      query: this._searchtext,
      lines: 1,
      pretty: 1,
      hl: 1
    }).done(function (result) {
      if (!result.index.nodes || result.index.nodes.length === 0) {
        //Handle no results here
        var msg = new psol.components.MessageDialog({
          title: 'Ihre Suchanfrage lieferte keine Ergebnisse',
          message: 'Keine Ergebnisse bei einer Ähnlichkeit von ' + this._quality + ' gefunden.'
        });
        msg.show();
      } else {
        this._result = result;

        this._stack.push({
          path: this._stack[this._stack.length - 1].path,
          scrollPos: 0,
          name: psol.translation.zTR('Suchergebnisse'),
          nodes: result.index.nodes,
          type: 'DIR'
        });
        //handle results here
        var append = result.offset > 0;
        if (!append) {
          $('.psol-comp-index-scroll-container').scrollTop(0);
        }
        //geoSearch._searchData.offset += geoSearch._searchData.limit;
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
    }.bind(this)).fail(function (jqXHR, textStatus, errorThrown) {
      var msg = new psol.components.MessageDialog({
        title: psol.translation.zTR('Server Fehler'),
        message: psol.translation.zTR('Fehler(%1): %2', [jqXHR.status, errorThrown])
      });
      msg.show();
      console.error(msg._message);
    }.bind(this)).always(function () {
      this._progressHandler.onProgressEnd(progressEvt);
    }.bind(this));
  };

  GeoSearchDemo.prototype._showProject = function (indexNode, view2Donly) {
    var that = this;
    $('.show3dButton').show(1);
    $('.indexComponentContainer').hide(1);
    $('.tableComponentContainer').show(1);


    // create Table component if not exists
    if (!that._tableComponent) {
      //init
      that._tableComponent = new psol.components.Table({
        $container: $('.tableComponentContainer'),
        erpEnabled: that._erpEnabled,
        wrapAllColumns: false,
        viewMode: psol.components.Table.TABLE_MODE.TABLE,
        dialogSettings: {
          fullWidth: false,
          fullHeight: false
        }
      });
      // table exec Variable clicked
      that._tableComponent.onExecVariableClicked = function (event) {
        that._showDocument(event.executabledoc);
      };
    }

    if (view2Donly) {
      if (!that._viewer2DComponent) {
        that._createViewer2DComponent();
      }
      if (that._viewer3DComponent) {
        that._viewer3DComponent.hide();
      }
      that._activeViewerComponent = that._viewer2DComponent;

    } else {
      if (!that._viewer3DComponent) {
        that._createViewer3DComponent();
      }
      if (that._viewer2DComponent) {
        that._viewer2DComponent.hide();
      }
      that._activeViewerComponent = that._viewer3DComponent;
      $('.show2dButton').show(0);
    }


    if (!that._projectTabCtrl) {
      var tabs = {
        table: {
          title: psol.translation.zTR('Tabelle'),
          view: that._tableComponent
        },
        viewer: {
          title: psol.translation.zTR('Vorschau'),
          view: that._activeViewerComponent
        }
      };
      that._projectTabCtrl = new TabCtrl($('.projectPage'), tabs);
      that._projectTabCtrl.init();
    }

    that._projectTabCtrl.setActiveTab('table');


    $.when(that._activeViewerComponent.show(), that._tableComponent.show()).done(function () {

      that._tableComponent.onTableChanged = function (tabledata) {
        var keepEnvironment = that._currentTableData && that._currentTableData.path === tabledata.path;

        that._currentTableData = tabledata;
        if (tabledata.lina) {
          that._setTitle(tabledata.lina);
        }
        if (that._activeViewerComponent === that._viewer2DComponent) {
          that._viewer2DComponent.loadByVarset(tabledata.path, tabledata.varsettransfer, undefined, {
            TypeDatabase2D: indexNode.type === 'DATABASE',
            name: indexNode.nn_name || indexNode.name
          });
          that._last2DTableData = that._currentTableData;
        }
        if (that._activeViewerComponent === that._viewer3DComponent) {
          that._viewer3DComponent.loadByVarset(tabledata.path, tabledata.varsettransfer, undefined, {
            keepEnvironment: keepEnvironment
          });
          that._last3DTableData = that._currentTableData;
        }
      };

      //load data after event is attached!
      that._tableComponent.load({
        path: indexNode.path,
        tabrestriction: indexNode.tabrestriction
      });
    });
  };


  $(document).ready(function () {

    //psol.core.setServiceBaseUrl('http://localhost:9020');
    //
    var geoSearch = new GeoSearchDemo();
    geoSearch.setUpProgressHandler();




    psol.core.setUserInfo({
      server_type: 'OEM_WEBSERVICE_webcomponentsdemo',
      title: 'Herr',
      firstname: 'Max',
      lastname: 'Mustermann',
      userfirm: 'CADENAS GmbH',
      street: 'Berliner Allee 28 b+c',
      zip: '86153',
      city: 'Augsburg',
      country: 'de',
      phone: '+49 (0) 821 2 58 58 0-0',
      fax: '+49 (0) 821 2 58 58 0-999',
      email: 'info@cadenas.de'
    });



    var progressEvt = new psol.components.ProgressEvent(psol.translation.zTR('ERP Login...'), psol.translation.zTR('ERP Login...'));
    geoSearch._progressHandler.onProgressBegin(progressEvt);

    geoSearch.init().done(function () {

      console.log('init Done');
      GeoSearchDemo.prototype._createViewer3DComponent = function () {
        var that = this;
        // create the viewer 3D component
        var webglViewerSettings = {
            shadeMode: psol.components.WebViewer3D.ShadeModes.ShadeAndLines,
            material: {
              preset: 'pcloud'
            }
          },
          radialMenuActions = undefined,
          favoriteActions = undefined;

        // Examples:

        /*
        webglViewerSettings = {
          ColorTL: '#ff0000',
          ColorTR: '#ff0000',
          ColorML: '#00ff00',
          ColorMR: '#00ff00',
          ColorBL: '#0000ff',
          ColorBR: '#0000ff',
          logoTexture: 'SOME_IMAGE_HERE',
          logoScaleFactor: 0.5,
          logoMixFactor: 0.5
        };
        */
        /*
        radialMenuActions = [{
          name: 'menu_shading',
          subActions: ['actLine', 'actShade', 'actShadeLine']
        }, {
          name: 'menu_rotation',
          subActions: ['actFront', 'actBack', 'actLeft', 'actRight', 'actTop', 'actBottom', 'actIsometric', 'actAnimate']
        }, {
          name: 'menu_vr',
          subActions: ['actVR', 'actAnaglyph', 'actDreamocHD3', 'actDreamocXL2', 'actFullscreen', 'actPseudoFullscreen', 'actCameraBackground']
        }, {
          name: 'menu_special',
          subActions: ['actZoomall', 'actZoomObject', 'actSaveCameraParams', 'actCut', 'actCustomDimensions', 'actExplosion', 'actLabels', 'actLeapMotion', 'actScreenShot']
        }];
        */

        favoriteActions = [
          'actCut',
          'actAnimate',
          'actVR',
          'actFullscreen',
          'actEnv',
          'actToggleRotationMode',
          'actToggleCameraMode',
          'actEnableHotSpots',
          'actHelp',
          'actTeleport'

        ];


        that._viewer3DComponent = new psol.components.WebViewer3D({
          $container: $('.View3D'),
          viewerBackendType: psol.components.WebViewer3D.ViewerBackends.WebGL,
          devicePixelRatio: Math.min(window.devicePixelRatio, 2), // cap the devicepixelratio for significant performance increase
          webglViewerSettings: webglViewerSettings,
          radialMenuActions: radialMenuActions,
          favoriteActions: favoriteActions,
          radialMenuInitialOpen: true,
          radialMenuRadius: 110,
          radialMenuAlignHorizontal: 'left',
          radialMenuAlignVertical: 'top',
          radialMenuStartDegree: 0,
          radialMenuEndDegree: 270,
          radialMenudirectionClockwise: true,
          onLinkClickedCallback: function (link) {
            console.log('prevented ' + link + ' from being opened ;)');
          }
        });

        that._viewer3DComponent.setActionState('actHoloLens', 'visible', true);

        that._viewer3DComponent.onCameraParams = function (params) {
          console.log(params);
        };
      };

      // create an IndexBrowsing component
      geoSearch._indexBrowsing = new psol.components.IndexBrowsing({
        $container: $('.indexComponentContainer'),
        useRetinaImages: false,
        erpEnabled: geoSearch._erpEnabled,
        viewType: psol.components.IndexBrowsing.ViewType.LIST
      });

      // up navigation
      $('.backButton').on('click', function onBackButton() {
        $('.show3dButton').hide(1);
        $('.indexComponentContainer').show(1);
        $('.tableComponentContainer').hide(1);

        if (geoSearch._stack.length > 1) {
          geoSearch._stack.pop();
          var stackObj = geoSearch._stack[geoSearch._stack.length - 1];


          var title = stackObj.nn_name || stackObj.name;
          geoSearch._setTitle(title);
          switch (stackObj.type) {
            case 'DIR':
              var def;
              //geoSearch._showIndex();
              if (stackObj.nodes && stackObj.nodes.length) {
                def = geoSearch._index.loadByIndexNodes(stackObj.nodes);
              } else {
                def = geoSearch._index.loadByPath(stackObj.path);
              }
              def.done(function () {
                var scrollTop = stackObj.scrollPos || 0;
                $('.IndexBrowsingScrollContainer').scrollTop(scrollTop);
              });
              break;
            case 'DATABASE':
            case 'NOCAD':
              geoSearch._showProject(stackObj, true);
              break;
            case 'PRJ':
              geoSearch._showProject(stackObj);
              break;
            case 'ASSI':
              geoSearch._showAssistant(stackObj);
              break;
            default:
              break;
          }
        }
      });

      // show the component
      geoSearch._indexBrowsing.show().done(function () {
        // load a path to the index component
        //geoSearch._indexBrowsing.loadByPath('/');
        geoSearch._indexBrowsing.onNodeClicked = function (event) {
          // reset scroll pos
          $('.IndexBrowsingScrollContainer').scrollTop(0);
          var title = event.indexNode.nn_name || event.indexNode.name;
          var setTitle = true;
          //geoSearch._updateHistory(event.indexNode);

          switch (event.indexNode.type) {
            case 'DIR':
              geoSearch._indexBrowsing.loadByIndexNode(event.indexNode);
              break;
            case 'DATABASE':
            case 'NOCAD':
              geoSearch._showProject(event.indexNode, true);
              break;
            case 'PRJ':
              geoSearch._showProject(event.indexNode);
              break;
            case 'DOC':
              setTitle = false;
              geoSearch._showDocument(event.indexNode.documentpath);
              break;
            case 'ASSI':
              geoSearch._showAssistant(event.indexNode);
              break;
            default:
              //console.log('Not yet implemented');
              break;
          }
          if (setTitle) {
            geoSearch._setTitle(title);
          }
        };
      });
      geoSearch._progressHandler.onProgressEnd(progressEvt);
    }).fail(function () {
      console.log('init Fail');
      geoSearch._progressHandler.onProgressEnd(progressEvt);
    });

  });
}());
