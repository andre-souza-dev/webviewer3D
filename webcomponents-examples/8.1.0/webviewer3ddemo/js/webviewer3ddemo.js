'use strict';
(function () {

  // this prevents the site zoomin on iOS, because iOS Safari does not respect user-scalable=no
  document.addEventListener('touchmove',
    function (e) {
      e.preventDefault();
    }, {
      passive: false
    });


  var $ = jQuery;
  $(document).ready(function () {

    // Create a settings object for the 3D web viewer:
    var radialMenuActions = [{
      name: 'menu_shading',
      subActions: [
        'actLine',
        'actShade',
        'actShadeLine',
        'actSAO'
      ]
    }, {
      name: 'menu_rotation',
      subActions: [
        'actFront',
        'actBack',
        'actLeft',
        'actRight',
        'actTop',
        'actBottom',
        'actIsometric',
        'actAnimate'
      ]
    }, {
      name: 'menu_vr',
      subActions: [
        'actVR',
        'actAnaglyph',
        'actBluebox',
        'actDreamocHD3',
        'actDreamocXL2',
        'actDreamocMOBILE',
        'actFullscreen',
        'actPseudoFullscreen',
        'actHoloLens'
      ]
    }, {
      name: 'menu_special',
      subActions: [
        'actZoomall',
        'actZoomObject',
        'actSaveCameraParams',
        'actCut',
        'actCustomDimensions',
        'actMeasureGrid',
        'actExplosion',
        'actLabels',
        'actHotSpots',
        'actDrawing',
        'actCameraBackground',
        'actScreenShot'
      ]
    }];
    var favoriteActions = [
      'actMeasureGrid',
      'actCut',
      'actDreamocHD3',
      'actAnimate',
      'actIsometric',
      'actCustomDimensions',
      'actLine',
      'actShadeLine',
      'actEnv',
      'actToggleRotationMode',
      'actEnableHotSpots',
      'actTeleport',
      'actBluebox'
    ];
    var webViewer3DSettings = {
      $container: $('#cnsWebViewer'),
      viewerBackendType: psol.components.WebViewer3D.ViewerBackends.WebGL,
      devicePixelRatio: window.devicePixelRatio,
      radialMenuActions: radialMenuActions,
      favoriteActions: favoriteActions,
      webglViewerSettings: {
        ColorTL: '#cccccc',
        ColorTR: '#cccccc',
        ColorML: '#eeeeee',
        ColorMR: '#eeeeee',
        ColorBL: '#ffffff',
        ColorBR: '#ffffff',
        showLogo: true,
        logoTexture: 'cns_logo.jpg',
        logoScaleFactor: 0.5,
        logoMixFactor: 0.5,
        material: {
          preset: 'pcloud',
          edit: false
        },
        measureGrid: {
          colors: {
            dimensions: '#000000',
            outline: '#0000ff',
            grid: '#757575'
          }
        },
        helperOptions: {
          gridOn: false,
          axisOn: false
        },
        shadeMode: psol.components.WebViewer3D.ShadeModes.ShadeAndLines,
        enableEditableDimensions: false, // false
        showPartNameTooltip: false //true
      }
    };

    // Create a WebViewer3D component:
    var webviewer3d = new psol.components.WebViewer3D(webViewer3DSettings);

    webviewer3d.onScreenshot = function (url) {
      window.open(url, '_blank');
    };
    webviewer3d.onMappedVarClicked = function (obj) {
      console.log(obj); //eslint-disable-line no-console
    };
    // show the component
    webviewer3d.show().done(function () {
      // please test with local models
    });
    $('.inputfile').on('change', function (e) {
      var files = e.currentTarget.files;

      webviewer3d.loadByGeomFile(files)
        .fail(function (error) {
          console.error('Error: status="' + error.status + '" -- statusText="' + error.statusText + '"'); //eslint-disable-line no-console
        });
    });

    var testInput = document.createElement('input');
    var webkitdirectoryAvailable = testInput.webkitdirectory === undefined ? false : true;

    if (webkitdirectoryAvailable) {
      $('.folderContainer').show();
      $('.inputfile2').on('change', function (e) {
        var files = e.currentTarget.files;

        webviewer3d.loadByGeomFile(files)
          .fail(function (data) {
            console.error(data); //eslint-disable-line no-console
          });
      });
    }

  });
})();
