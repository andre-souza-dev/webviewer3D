'use strict';

(function () {
  document.addEventListener('touchmove',
    function (e) {
      e.preventDefault();
    }, {
      passive: false
    });

  var $ = jQuery;
  var webviewer3d;
  var compareViewerTableBridge;

  function compare_prj_prj(e) {
    var prj1 = $(e.currentTarget).parent().find('input#project1').val();
    var prj2 = $(e.currentTarget).parent().find('input#project2').val();

    compareViewerTableBridge.setVarsetTransfer(null, false, false);
    compareViewerTableBridge.setCompareVarsetTransfer(null, false, false);
    compareViewerTableBridge.setCompareType(psol.components.CompareViewerTableBridge.CompareType.PRJ_PRJ);
    compareViewerTableBridge.setProjectPaths(prj1, prj2);
    compareViewerTableBridge._updateTable();

    webviewer3d.loadCompareByVarset(prj1, null, null, prj2, null, null);
  }

  function compare_file_prj(e) {
    var file = $(e.currentTarget).parent().find('input#file')[0].files;
    var prj = $(e.currentTarget).parent().find('input#project').val();

    compareViewerTableBridge.setVarsetTransfer(null, false, false);
    compareViewerTableBridge.setCompareVarsetTransfer(null, false, false);
    compareViewerTableBridge.setCompareType(psol.components.CompareViewerTableBridge.CompareType.FILE_PRJ);
    compareViewerTableBridge.setCompareFile(file);
    compareViewerTableBridge.setProjectPath(prj);
    compareViewerTableBridge._updateTable();

    webviewer3d.loadCompareByFileAndPrj(file, prj);
  }

  function compare_file_file(e) {
    var file1 = $(e.currentTarget).parent().find('input#file1')[0].files;
    var file2 = $(e.currentTarget).parent().find('input#file2')[0].files;

    webviewer3d.loadCompareByFileAndFile(file1, file2);
  }

  $(document).ready(function () {


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

    $('.compareoption').hide(0);
    var option = $('.compareselect option:selected').val();
    $('.' + option).show(0);

    $('.compareselect').on('change', function () {
      $('.compareoption').hide(0);
      var option = $('.compareselect option:selected').val();
      $('.' + option).show(0);
    });


    $('.inputfile').on('change', function (e) {
      var $input = $(e.currentTarget);
      var $label = $input.next();
      var fileName = '';
      var fileListLength = $input[0].files.length;

      if (fileListLength === 1) {
        fileName = $input[0].files[0].name;
      } else if (fileListLength > 1) {
        fileName = fileListLength + ' files selected';
      } else {
        return;
      }



      if (fileName) {
        $label.find('span').html(fileName);
      }
    });

    // Create a settings object for the 3D web viewer:
    var webViewer3DSettings = {
      $container: $('.compareviewer'),
      viewerBackendType: psol.components.WebViewer3D.ViewerBackends.WebGL,
      devicePixelRatio: window.devicePixelRatio,
      compare: {
        cutColorPart1: '#00af50',
        cutColorPart2: '#ec5e5e',
        cutColorPartsOverlap: '#ffff00',
        compareFile1Color: '#00af50',
        compareFile2Color: '#ec5e5e'
      },
      webglViewerSettings: {
        preferformat: 'ASM_GLTF,PARTJAVA3D'
      }
    };

    // Create a WebViewer3D component:
    webviewer3d = new psol.components.WebViewer3D(webViewer3DSettings);
    webviewer3d.show().done(function () {
      $('.compare_prj_prj').on('click', compare_prj_prj);
      $('.compare_file_prj').on('click', compare_file_prj);
      $('.compare_file_file').on('click', compare_file_file);
    });

    compareViewerTableBridge = new psol.components.CompareViewerTableBridge(webviewer3d, null, {
      setBackToDefaultView: false
    });
  });
}());
