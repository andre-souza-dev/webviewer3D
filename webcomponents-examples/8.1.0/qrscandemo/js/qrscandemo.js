'use strict';

(function () {
  var $ = jQuery;

  $(document).ready(function () {

    var $container = $('.qrcontainer');
    var qrscan = new psol.components.QRScan({
      $container: $container,
      areaScanning: false
    });

    qrscan.onResult = function (result) {
      $('.qrcodecontent').text(result);
    };
    qrscan.show().done(function () {
      qrscan.startScanning();
    });
  });
}());
