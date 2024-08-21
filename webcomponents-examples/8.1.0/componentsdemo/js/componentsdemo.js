/* eslint-disable no-console */
'use strict';

var componentsDemo;

(function () {
  var $ = jQuery;

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

  function ComponentsDemo() {
    this._stack = [];
    this._index = undefined;
    this._erpEnabled = false;
    //this._filterElement = undefined;
    this._searchElement = undefined;
    this._deliveryElement = undefined;
    this._searchBarComponent = undefined;
    this._deliveryCountryComponent = undefined;
    this._filter = '';
    this._currentTableData = undefined;
    this._projectTabCtrl = undefined;
    this._tableComponent = undefined;
    this._viewer3DComponent = undefined;
    this._viewer2DComponent = undefined;
    this._activeViewerComponent = undefined;

    this._last3DTableData = undefined;
    this._last2DTableData = undefined;
    this._viewerComponentContainer = undefined;
    this._viewerTableBridge = undefined;

  }

  ComponentsDemo.prototype.init = function () {
    var that = this;

    // overwrite the browser language
    //psol.core.setLanguage(psol.core.getLanguageByShortIso('en').language);

    // only for testing with CORS
    //psol.core.setServiceBaseUrl('https://mobileapps.partcommunity.com');
    //
    psol.core.addGlobalHttpHeader('Portal', 'b2b');
    psol.core.addGlobalHttpHeader('appname', 'oem_apps_cadenas_webcomponentsdemo');
    psol.core.addGlobalHttpHeader('appversion', psol.components.VERSION);
    psol.core.setApiKey('66c56a38010f4a81a82f6ed51c903399');


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

    var initPromise = $.Deferred();

    //that._filterElement = $('.filterInput');
    that._searchElement = $('.searchIputContainer');
    that._deliveryElement = $('.countryDeliveryContainer');
    that._initTranslations().done(function () {
      psol.erp.isErpEnabled()
        .done(function (erpEnabled) {
          if (erpEnabled) {
            that._erpEnabled = true;
            // TODO: hard coded login and role
            psol.erp.setUserData('demo', 'demo');
            psol.erp.login().done(function () {
              psol.erp.selectGroup('DUMMY').done(function () {
                psol.erp.setFiltersEnabled(true);
                initPromise.resolve();
              });
            });
          } else {
            initPromise.resolve();
          }
        })
        .fail(function () {
          initPromise.resolve();
        });
    });
    that._viewerComponentContainer = $('.viewerComponentContainer');

    // up navigation
    $('.backButton').on('click', function onBackButton() {
      //that._emptyFilter();
      if (that._stack.length > 1) {
        that._stack.pop();
        var stackObj = that._stack[that._stack.length - 1];
        var title = stackObj.nn_name || stackObj.name;
        that._setTitle(title);
        switch (stackObj.type) {
          case 'DIR':
            that._showIndex();
            if (stackObj.nodes && stackObj.nodes.length) {
              that._index.loadByIndexNodes(stackObj.nodes);
            } else {
              that._index.loadByPath(stackObj.path);
            }
            break;
          case 'DATABASE':
          case 'NOCAD':
            that._showProject(stackObj, true);
            break;
          case 'PRJ':
            that._showProject(stackObj);
            break;
          case 'ASSI':
            that._showAssistant(stackObj);
            break;
          case 'TEXTSEARCH':
            that._showIndex();
            that._index.loadByFulltextResult(stackObj.searchResult, false, {
              showCatalogImages: true,
              isPartsResult: that._searchBarComponent.getSearchResultType() === psol.search.SearchResultType.Parts ? true : false
            });
            break;
          default:
            break;
        }
      }
    });

    // order button demo
    $('.orderButton').on('click', function onOrderButton() {
      that._orderCAD();
    });

    return initPromise.promise();
  };

  ComponentsDemo.prototype._createViewer2DComponent = function () {
    var that = this;
    var settings = {
      $container: $('.View2D'),
      //backgroundColor: '#F5FFFA',
      viewerType: psol.components.WebViewer2D.ViewType.TECH_VIEW
      //viewerType: psol.components.WebViewer2D.ViewType.DERIVATION_VIEW
    };
    that._viewer2DComponent = new psol.components.WebViewer2D(settings);
    that._viewer2DComponent._onact3D = function () {
      $('.View2D').hide(0);
      $('.View3D').show(0);
      that._viewer2DComponent.hide();

      if (!that._viewer3DComponent) {
        that._createViewer3DComponent();
      }
      that._activeViewerComponent = that._viewer3DComponent;
      that._viewer3DComponent.show().done(function () {
        if (that._last3DTableData !== that._currentTableData) {
          that._viewer3DComponent.loadByVarset(that._currentTableData.path, that._currentTableData.varsettransfer).fail(function (error) {
            console.error(error);
          });
          that._last3DTableData = that._currentTableData;
        }
      });
    };
  };
  ComponentsDemo.prototype._createViewer3DComponent = function () {
    var that = this;
    // create the viewer 3D component
    var webglViewerSettings = {
      shadeMode: psol.components.WebViewer3D.ShadeModes.ShadeAndLines,
      material: {
        preset: 'psol_v9'
      },
      preferformat: 'ASM_GLTF,PARTJAVA3D',

      /*
      ColorTL: '#000000',
      ColorTR: '#000000',
      ColorML: '#000000',
      ColorMR: '#000000',
      ColorBL: '#000000',
      ColorBR: '#000000',
      colorLineVisible: '#ffffffff', // ARGB HEX
      colorLineHidden: '#00ffffff', // ARGB HEX
      colorDimension: '#ffffff' // RGB HEX
      */

      showLogo: true,
      logoTexture: '../componentsdemo/img/cadenas_logo.png',
      logoScaleFactor: 0.1,
      logoMixFactor: 0.2,
      logoPositionX: -1.0,
      logoPositionY: -1.0,
      logoBorderGap: 0.06,
      rotationCube: true,
      showOriginAxes: true
    };
    var radialMenuActions = undefined;
    var favoriteActions = undefined;

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
      'actPseudoVR',
      'actFullscreen',
      'actEnv',
      'actToggleRotationMode',
      'actToggleCameraMode',
      'actEnableHotSpots',
      'actTeleport',
      'act2D',
      'actErpFilter',
      'actHelp',
      'actExternalAR'
    ];


    that._viewer3DComponent = new psol.components.WebViewer3D({
      $container: $('.View3D'),
      viewerBackendType: psol.components.WebViewer3D.ViewerBackends.WebGL,
      // devicePixelRatio: Math.min(window.devicePixelRatio, 2), // cap the devicepixelratio for significant performance increase
      devicePixelRatio: window.devicePixelRatio,
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
      onLinkClickedCallback: function (link, hotspot) {
        console.log('prevented ' + link + ' from being opened ;)');
        console.log(hotspot);
      }
    });

    //that._viewer3DComponent.setActionState('actHoloLens', 'visible', true);

    that._viewer3DComponent.onCameraParams = function (params) {
      console.log(params);
    };
    that._viewer3DComponent._onact2D = function () {
      $('.View3D').hide(0);
      $('.View2D').show(0);
      that._viewer3DComponent.hide();

      if (!that._viewer2DComponent) {
        that._createViewer2DComponent();
      }
      that._activeViewerComponent = that._viewer2DComponent;
      that._viewer2DComponent.setActionState('act3D', 'visible', true);
      that._viewer2DComponent.show().done(function () {
        if (that._last2DTableData !== that._currentTableData) {
          //TODO TypeDatabase2D
          that._viewer2DComponent.loadByVarset(that._currentTableData.path, that._currentTableData.varsettransfer);
          that._last2DTableData = that._currentTableData;
        }
      });
    };
  };


  ComponentsDemo.prototype._initTranslations = function () {
    var $translationsPromise = new $.Deferred();
    // first use the api
    psol.translation.getTranslationByUrlAsync('translations/componentsdemo.json')
      .done(function () {
        $translationsPromise.resolve();
      })
      .fail(function () {
        console.warn('could not load translation file');
        $translationsPromise.resolve();
      });
    return $translationsPromise.promise();
  };

  ComponentsDemo.prototype._setTitle = function (title) {
    title = title.trim();
    $('.title').html(title);
  };

  ComponentsDemo.prototype._showDocument = function (docPath) {
    var url = new psol.thirdparty.URI(docPath);
    if (url.is('relative')) {
      docPath = psol.core.getServiceBaseUrl() + '/23d-libs/' + docPath;
    }

    window.open(docPath, '_blank');
  };
  ComponentsDemo.prototype._updateHistory = function ( /*indexNode*/ ) {
    /*if (window.history && window.history.pushState) {
      var title = indexNode.nn_name || indexNode.name;
      window.history.pushState(title, title, (window.location.href.split('?'))[0] + '?path=' + encodeURIComponent(indexNode.path));
    }*/
  };
  ComponentsDemo.prototype._navigateTo = function (path) {
    var that = this;
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
              that._index.onNodeClicked({
                indexNode: indexNode
              });
            }
          }
        }
      });
    }
  };

  ComponentsDemo.prototype._createIndex = function () {
    // helper
    var getParameterByName = function (name, url) {
      if (!url) {
        url = window.location.href;
      }
      name = name.replace(/[[\]]/g, '\\$&');
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
      if (!results) {
        return null;
      }
      if (!results[2]) {
        return '';
      }
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }; //

    var that = this;
    // create an IndexBrowsing component
    that._index = new psol.components.IndexBrowsing({
      $container: $('.indexComponentContainer'),
      useRetinaImages: false,
      erpEnabled: this._erpEnabled,
      enableAlphabeticNavigation: true,
      alphabeticNavigationPosition: psol.components.IndexBrowsing.AlphabeticNavigationPosition.RIGHT,
      enableBackNode: true,
      enableBackToAllNode: true,
      eol: true,
      enableDynamicFilterAssistantNode: true
    });

    // show the component
    that._index.show().done(function () {

      // load a path to the index component
      that._stack.push({
        path: '/',
        name: psol.translation.zTR('Kataloge'),
        type: 'DIR'
      });
      that._setTitle(psol.translation.zTR('Kataloge'));



      var parameterPath = getParameterByName('path');
      if (parameterPath) {
        that._navigateTo(parameterPath);
      } else {
        that._index.loadByPath('/');
      }

      that._searchBarComponent.onResult = function (result) {
        that._stack.push({
          path: that._stack[that._stack.length - 1].path,
          name: psol.translation.zTR('Suchergebnisse'),
          searchResult: result,
          type: 'TEXTSEARCH'
        });
        that._setTitle(psol.translation.zTR('Suchergebnisse'));
        that._index.loadByFulltextResult(result, false, {
          showCatalogImages: true,
          isPartsResult: that._searchBarComponent.getSearchResultType() === psol.search.SearchResultType.Parts ? true : false
        });
      };

      that._deliveryCountryComponent.onReload = function (isoCode, path) {
        that._index.reloadIndexBrowsing(isoCode, path);
      };

      that._index.onNodeClicked = function (event) {
        var title = event.indexNode.nn_name || event.indexNode.name;
        var setTitle = true;
        that._updateHistory(event.indexNode);
        var pushToStack = true;
        switch (event.indexNode.type) {
          case 'DIR':
            that._index.loadByIndexNode(event.indexNode);
            break;
          case 'DATABASE':
          case 'NOCAD':
            that._showProject(event.indexNode, true);
            break;
          case 'PRJ':
            that._showProject(event.indexNode);
            break;
          case 'DOC':
            pushToStack = false;
            setTitle = false;
            that._showDocument(event.indexNode.documentpath);
            break;
          case 'ASSI':
            that._showAssistant(event.indexNode);
            break;
          default:
            console.log('Not yet implemented');
            break;
        }
        if (pushToStack) {
          that._stack.push(event.indexNode);
        }
        if (setTitle) {
          that._setTitle(title);
        }
      };

      that._index.onDynamicFilterAssistantSearchClicked = function (event) {
        /* Content of event.data */
        /* {
             catalogs: ['ahp', 'skfkoenig'],
             query: QueryString
           }*/

        $('.assistantPage').hide(0);
        // that._index.hide();

        psol.search.startFullTextSearchAsync(event.data).then(function (result) {
          that._stack.push({
            path: that._stack[that._stack.length - 1].path,
            name: psol.translation.zTR('Suchergebnisse'),
            searchResult: result,
            type: 'TEXTSEARCH'
          });

          that._setTitle(psol.translation.zTR('Suchergebnisse'));
          that._showIndex();
          that._index.loadByFulltextResult(result, false, {
            showCatalogImages: true,
            isPartsResult: that._searchBarComponent.getSearchResultType() === psol.search.SearchResultType.Parts ? true : false
          });
        });

      };
    });
  };

  ComponentsDemo.prototype._showIndex = function () {
    var that = this;

    $('.pages').children().hide(0);
    $('.orderButton').hide(0);
    $('.indexPage').show(0);

    // var top = that._deliveryElement.position().top + that._deliveryElement.outerHeight();
    // $('.indexComponentContainer').css({
    //   top: top
    // });

    if (!that._index) {
      that._createIndex();
    }
  };

  ComponentsDemo.prototype._showProject = function (indexNode, view2Donly) {
    var that = this;
    $('.pages').children().hide(0);
    $('.orderButton').show(0);
    $('.projectPage').show(0);


    // create Table component if not exists
    if (!that._tableComponent) {
      //init
      that._tableComponent = new psol.components.Table({
        $container: $('.tableComponentContainer'),
        erpEnabled: that._erpEnabled,
        wrapAllColumns: false,
        viewMode: psol.components.Table.TABLE_MODE.LIST,
        useServerColors: false,
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
      that._viewer2DComponent.setActionState('act3D', 'visible', false);
      that._activeViewerComponent = that._viewer2DComponent;

    } else {
      if (!that._viewer3DComponent) {
        that._createViewer3DComponent();
      }
      if (that._viewer2DComponent) {
        that._viewer2DComponent.hide();
      }
      that._activeViewerComponent = that._viewer3DComponent;
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

    that._projectTabCtrl.setActiveTab('viewer');

    $.when(that._activeViewerComponent.show(), that._tableComponent.show()).done(function () {

      if (view2Donly) {
        that._activeViewerComponent.loadByVarset(indexNode.path, '', '');

        that._tableComponent.load({
          path: indexNode.path,
          tabrestriction: indexNode.tabrestriction,
          selectrowlineid: indexNode.lineid,
          selectrowlineidlow: indexNode.linesubid
        }).then(function () {
          that._currentTableData = that._tableComponent.getTableData();
        });

      } else {
        if (!that._viewerTableBridge) {
          that._viewerTableBridge = new psol.components.ViewerTableBridge(that._viewer3DComponent, that._tableComponent);
        }

        that._viewerTableBridge.onVarsetTransferChanged = function (varsettransfer) {
          // set title
          if (that._activeViewerComponent === that._viewer2DComponent) {
            that._viewer2DComponent.loadByVarset(that._currentTableData.path, varsettransfer, undefined, {
              TypeDatabase2D: indexNode.type === 'DATABASE',
              name: indexNode.nn_name || indexNode.name
            });
            that._last2DTableData = that._currentTableData;
          } else if (that._activeViewerComponent === that._viewer3DComponent) {
            that._last3DTableData = that._currentTableData;
          }
        };

        that._viewerTableBridge.setProjectPath(indexNode.path);
        that._viewerTableBridge.setVarsetTransfer('', true, false);
        // viewerBridge.setMIdent('', true, false);

        //load data after event is attached!
        that._tableComponent.setAdditionalOptions({
          withtranslations: indexNode.languages.join(',')
        });

        var loadOptions = {
          path: indexNode.path,
          tabrestriction: indexNode.tabrestriction,
          selectrowlineid: indexNode.lineid,
          selectrowlineidlow: indexNode.linesubid,
          varsettransfer: indexNode.varset
        };

        if (indexNode.varset) {
          loadOptions.mident = indexNode.varset;
        }

        that._tableComponent.load(loadOptions)
          .then(function () {
            that._currentTableData = that._tableComponent.getTableData();
          });

      }
    });
  };

  ComponentsDemo.prototype._showAssistant = function (indexNode) {
    var that = this;

    $('.pages').children().hide(0);
    $('.orderButton').hide(0);

    $('.assistantPage').show(0);

    var assistantComponent;

    var settings = {
      $container: $('.ViewAssistant')
    };

    /*if (indexNode.asstype === psol.index.AssistantType.CALC) {
      assistantComponent = new psol.components.CalcAssistant(settings);
    } else if (indexNode.asstype === psol.index.AssistantType.CALC_SEARCH) {
      assistantComponent = new psol.components.SearchAssistant(settings);
    } else if (indexNode.asstype === psol.index.AssistantType.FILTER_SEARCH) {
      assistantComponent = new psol.components.FilterAssistant(settings);
    }*/
    assistantComponent = new psol.components.Assistant(settings);

    if (assistantComponent) {
      assistantComponent.show().done(function () {
        assistantComponent.loadByPath(indexNode.path);

        assistantComponent.onResetClicked = function (event) {
          assistantComponent.loadByPath(event.data);
        };
      });
    }
  };

  ComponentsDemo.prototype._orderCAD = function () {
    var that = this;
    //var format = '3DSTUDIOMAX';
    //var format = 'PDFDATASHEET';
    var format = 'meta3DV2';


    var tableData = that._tableComponent.getTableData();


    /**/ // pappserver export variant
    var options = {
      path: tableData.path,
      varsettransfer: tableData.varsettransfer,
      format: format
    };

    psol.exports.getExportFileUrlAsync(options)
      .done(function (orderResponse) {
        var uri = new psol.thirdparty.URI(psol.core.getServiceBaseUrl() + orderResponse.url);
        var downloadEl = document.createElement('a');
        downloadEl.style = 'display: none';
        document.body.appendChild(downloadEl);
        downloadEl.href = uri.toString();
        var filename = tableData.NB + '.' + uri.suffix(true);


        if (tableData.NN && tableData.NN !== '') {
          filename = tableData.NN + ' - ' + filename;
        }
        filename = window.encodeURIComponent(filename);

        // the .download attribute only works correctly on same origin, so no cross origin!
        downloadEl.download = filename;
        //programatically click the link to trigger the download
        downloadEl.click();
      });
    /**/

    /*/ // partserver order variant
    var orderOptions = {
      downloadflags: 'ZIP'
    };

    psol.order
      .orderData(
        '',
        tableData.path, tableData.varsettransfer, format, orderOptions, false)
      .done(function (orderResponse) {
        console.log(orderResponse);
      })
      .fail(function (orderResponse) {
        console.error(orderResponse);
      });
    /**/
  };

  $(document).ready(function () {
    var iOSVersion;
    //$.support.cors = true;

    if (/iP(hone|od|ad)/.test(navigator.platform)) {
      // supports iOS 2.0 and later
      var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
      iOSVersion = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
      iOSVersion = parseInt(iOSVersion[0]);
    }

    if (iOSVersion >= 7) {
      $('head').append('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">');
      if (window.navigator.standalone) {
        var offset = 20;
        var height = $('.header').outerHeight();
        $('.header').css({
          height: height + offset
        });
        $('.title').css({
          marginTop: offset
        });
        $('.pages').css({
          top: height + offset
        });
      }
    } else {
      $('head').append('<meta name="apple-mobile-web-app-status-bar-style" content="black">');
    }

    componentsDemo = new ComponentsDemo();
    componentsDemo.init().done(function () {


      /*
      // progress handling
      // If you want to implement your own progress handler, take a look at this code

      // progressEvent have some properties like title or text
      psol.components.ProgressHandler.onProgressBegin = function (componentInstance, progressEvent) {
        // show your own progress ui here
      };


      psol.components.ProgressHandler.onProgressUpdate = function (componentInstance, progressEvent) {
        // update your own progress here
      };

      psol.components.ProgressHandler.onProgressEnd = function (componentInstance, progressEvent) {
        // hide your own progress here
      };
      */

      componentsDemo._searchBarComponent = new psol.components.SearchBar({
        $container: componentsDemo._searchElement,
        searchType: psol.components.SearchBar.SearchType.Fulltext,
        eol: true,
        enableSearchType: true,
        enableSearchIn: true,
        enableSearchResultType: true
      });
      componentsDemo._deliveryCountryComponent = new psol.components.DeliveryCountry({
        $container: $('.countryDeliveryContainer'),
        path: '/'
      });

      $.when(componentsDemo._searchBarComponent.show(), componentsDemo._deliveryCountryComponent.show()).done(function () {
        componentsDemo._showIndex();
      });
    });
  });
}());
