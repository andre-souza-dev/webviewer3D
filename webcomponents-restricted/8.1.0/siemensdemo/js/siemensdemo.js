/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable indent */
'use strict';

jQuery(document).ready(function () {
  psol.core.setApiKey('66c56a38010f4a81a82f6ed51c903399');
  psol.core.setUserInfo({
    server_type: 'OEM_WEBSERVICE_webcomponentsdemo',
    userfirm: '' // example: if user is t.sielaff@cadenas.de then pass "cadenas".
  });
  psol.core.setServiceBaseUrl('https://webapi.partcommunity.com');

  // use local var for jQuery.
  var $ = jQuery;

  // prepare 3d viewer.
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
      'actTeleport'
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
          grid: '#757575',
          unit: 'INCH'
        }
      },
      helperOptions: {
        gridOn: false,
        axisOn: false
      },
      shadeMode: psol.components.WebViewer3D.ShadeModes.ShadeAndLines,
      enableEditableDimensions: false,
      showPartNameTooltip: false
    }
  };

  // Create a WebViewer3D component.
  var webviewer3d = new psol.components.WebViewer3D(webViewer3DSettings);
  webviewer3d.show();

  // run search and display result in 3D viewer.
  $('#txtOrderNumber').on('keyup', function (event) {
    // we only care for the enter key.
    if (event.which !== 13) {
      return;
    }

    // do a reverse lookup with the part number
    psol.core.ajaxGetOrPost({
      url: psol.core.getServiceBaseUrl() + '/service/reversemap',
      data: {
        catalog: 'siemens',
        part: $('#txtOrderNumber').val(),
        exact: '0'
      }
    }).then(function (reverseMapResult) {
      var mident = reverseMapResult.mident || '';

      // has mident?
      if (mident.length === 0) {
        alert('Part not found.');
      } else {
        // 
        webviewer3d.loadByVarset(null, null, mident, {});

        // enable download button and set onClick event.
        $('#btnDownload').removeAttr('disabled');
        $('#btnDownload').click(function (event) {
          var downloadDialog = new psol.components.DownloadDialog({
            mident: mident
          });
          downloadDialog.show();
        });
      }
    });
  });
});
