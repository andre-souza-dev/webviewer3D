'use strict';

(function () {
  var $ = jQuery;
  $(document).ready(function () {
    var favoriteActions = [
      'actToggleCenterLines',
      'actToggleDashedLines',
      'actToggleDimLines',
      'actToggleSolidLines',
      'actZoomAll2d',
      'act3D',
      'actErpFilter',
      'actHelp'
    ];

    var settings = {
      $container: $('.container'),
      favoriteActions: favoriteActions
    };

    var webviewer2d = new psol.components.WebViewer2D(settings);
    webviewer2d.show().then(function () {



      /*
      var path = '';
      var varsettransfer = '';
      var mident = '';
      
      
      
      path = 'setco/slides/dovetail_slides/m_series/m_series_asmtab.prj';
      //mident = '{setco/slides/dovetail_slides/m_series/m_series_asmtab.prj},{NB=M0_0},{SER=M},{SC=},{SW=0},{SWT=},{TSP=},{SP=0},{SPT=},{HFO=},{HO=},{HFA=},{HFAP=},{WP=},{MSL=},{SS=},{HFOT=},{HFAT=},{HFAPT=},{WPT=},{MSLT=},{PPATH=parts/m_series_asmtpl.prj}';
      //mident = '{setco/slides/dovetail_slides/m_series/m_series_asmtab.prj},{NB=M00_000},{SER=M},{SC=C},{SW=0},{SWT=0},{TSP=0},{SP=0},{SPT=0},{HFO=},{HO=},{HFA=},{HFAP=},{WP=},{MSL=},{SS=},{HFOT=},{HFAT=},{HFAPT=},{WPT=},{MSLT=},{PPATH=parts/m_series_asmtpl.prj}';
      
      
      //varsettransfer = 'AAAEQnicnZTLDoIwEEX3fgWyN4X9OAkBiSYoJG0gLot20QQx4aG_2Fb6U_2BAqu2m86d6Zy0vWkL6ySP2bnYeYzXmeyHUoonroCKRlwGeW_2B9h_2Bh6Fbd_2B6HsImWyFHg9XDAMgHzmV6FgruQl1VWdaIyRRyZtR9AQhrbREKHkned2o6RO_2FCaQxkEnA1IAq1eIdv51LppozgRHD7CFGC4eVnBiH3e3TfA6ZMA5IGrkwhTVU2SNHmlkzlDocJ2cuHjhBy6tg5Jw9o6wzgMj_2F4ZLf_2F4AvH7Fu7g_3D_3D';
      webviewer2d.loadByVarset(path, varsettransfer, mident);
      */

      // webviewer2d.loadByVarset('a4hydrauliek/befestigungsaugen/clevis_eye_g2.prj', '', '');

      //var url = 'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/bzrfeed.svg';
      //var url = 'http://localhost:9020/23d-libs/boellhoff/_pool_/ff/f9/din_965_edelstahl_a4_kreuzschlitz_z__mv_2018-12-10.svg';

      var dataUrl = 'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iem9vbWFibGVfc3ZnIiB3aWR0aD0iMjY1IiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSItMTgyLjUgLTkwIDM2NSAxODAiIHhtbG5zID0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48ZyBjbGFzcz0iem9vbV9ncm91cCI+DQo8dGl0bGU+RTpcRmlsZV9TdG9yYWdlXFBhcnRcQlhMXEEzMFxEOTlcNjAxXDA2NVwxMUVcOUFCXDNBMFxBMzVcNjBBXDRDQ0NDXGRpb2RlMi5ieGwgRGlvZGUyIC0gUENCIEZvb3RwcmludCAvIExhbmQgUGF0dGVybjwvdGl0bGU+DQo8ZGVzYz5QQ0IgRm9vdHByaW50IC8gTGFuZCBQYXR0ZXJuIG9mIEU6XEZpbGVfU3RvcmFnZVxQYXJ0XEJYTFxBMzBcRDk5XDYwMVwwNjVcMTFFXDlBQlwzQTBcQTM1XDYwQVw0Q0NDQ1xkaW9kZTIuYnhsIERpb2RlMiBzaG93aW5nIGhvdyBDQUQgbW9kZWwgbG9va3MgYW5kIG9wZXJhdGVzIGJlZm9yZSB1c2VyIGRvd25sb2FkczwvZGVzYz4NCg0KPGcgaWQ9IlRPUCIgc3R5bGU9InZpc2liaWxpdHk6dmlzaWJsZSI+DQo8cmVjdCB4PSItMTMyLjUiIHk9Ii0zMCIgd2lkdGg9IjkwIiBoZWlnaHQ9IjYwIiBzdHlsZT0iZmlsbDojNzM3MzczO3N0cm9rZTojNzM3MzczO3BvaW50ZXItZXZlbnRzOiBhbGwiIGNsYXNzPSIiIGRhdGEtcGluX251bWJlcj0gIjEiPjwvcmVjdD4NCjxyZWN0IHg9IjQyLjUiIHk9Ii0zMCIgd2lkdGg9IjkwIiBoZWlnaHQ9IjYwIiBzdHlsZT0iZmlsbDojNzM3MzczO3N0cm9rZTojNzM3MzczO3BvaW50ZXItZXZlbnRzOiBhbGwiIGNsYXNzPSIiIGRhdGEtcGluX251bWJlcj0gIjIiPjwvcmVjdD4NCjwvZz4NCjxnIGlkPSJDT05UQUNUX0FSRUEiIHN0eWxlPSJ2aXNpYmlsaXR5OnZpc2libGUiPg0KPC9nPg0KPGcgaWQ9IlBJTl9OVU1CRVIiIHN0eWxlPSJ2aXNpYmlsaXR5OnZpc2libGUiPg0KPHRleHQgeD0iLTg3LjUiIHk9IjAiIGZvbnQtZmFtaWx5PSJDb3VyaWVyIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMy4zMzMzMzMiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InJvdGF0ZSgwLC04Ny41LDApIiBjbGFzcz0iIiBkYXRhLXBpbl9udW1iZXI9ICIxIj4xPC90ZXh0Pg0KPHRleHQgeD0iODcuNSIgeT0iMCIgZm9udC1mYW1pbHk9IkNvdXJpZXIiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIzLjMzMzMzMyIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0icm90YXRlKDAsODcuNSwwKSIgY2xhc3M9IiIgZGF0YS1waW5fbnVtYmVyPSAiMiI+MjwvdGV4dD4NCjwvZz4NCjxnIGlkPSJUT1BfQVNTRU1CTFkiIHN0eWxlPSJ2aXNpYmlsaXR5OnZpc2libGUiPg0KPGxpbmUgeDE9Ii02MCIgeTE9IjQwIiB4Mj0iNjAiIHkyPSI0MCIgc3R5bGU9InN0cm9rZTojQzgxMDJFO3N0cm9rZS13aWR0aDoxIiBjbGFzcz0ic3ZnX3NoYXBlIiA+PC9saW5lPg0KPGxpbmUgeDE9IjYwIiB5MT0iNDAiIHgyPSI2MCIgeTI9Ii00MCIgc3R5bGU9InN0cm9rZTojQzgxMDJFO3N0cm9rZS13aWR0aDoxIiBjbGFzcz0ic3ZnX3NoYXBlIiA+PC9saW5lPg0KPGxpbmUgeDE9IjYwIiB5MT0iLTQwIiB4Mj0iLTYwIiB5Mj0iLTQwIiBzdHlsZT0ic3Ryb2tlOiNDODEwMkU7c3Ryb2tlLXdpZHRoOjEiIGNsYXNzPSJzdmdfc2hhcGUiID48L2xpbmU+DQo8bGluZSB4MT0iLTYwIiB5MT0iLTQwIiB4Mj0iLTYwIiB5Mj0iNDAiIHN0eWxlPSJzdHJva2U6I0M4MTAyRTtzdHJva2Utd2lkdGg6MSIgY2xhc3M9InN2Z19zaGFwZSIgPjwvbGluZT4NCjwvZz4NCjxnIGlkPSJCb3VuZGluZ1JlY3RzIiBzdHlsZT0idmlzaWJpbGl0eTp2aXNpYmxlIj48cmVjdCB4PSItMTMyLjUiIHk9Ii0zMCIgd2lkdGg9IjkwIiBoZWlnaHQ9IjYwIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTpub25lO3BvaW50ZXItZXZlbnRzOiBhbGwiIGNsYXNzPSJwaW4iIGRhdGEtcGluX2JvdW5kaW5nX3JlY3Q9ICIxIj48L3JlY3Q+PHJlY3QgeD0iNDIuNSIgeT0iLTMwIiB3aWR0aD0iOTAiIGhlaWdodD0iNjAiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOm5vbmU7cG9pbnRlci1ldmVudHM6IGFsbCIgY2xhc3M9InBpbiIgZGF0YS1waW5fYm91bmRpbmdfcmVjdD0gIjIiPjwvcmVjdD48L2c+DQo8L2c+DQo8L3N2Zz4=';

      // webviewer2d.loadSVG(url);
      webviewer2d.loadSVGByDataUrl(dataUrl);
    });


    $('.inputfile').on('change', function (e) {
      var file = e.currentTarget.files[0];
      var reader = new FileReader();
      reader.onloadend = function (evt) {
        webviewer2d.loadByPJVData(evt.target.result);
      };
      reader.readAsText(file, 'ISO-8859-1');
    });
  });
}());
