/*global $, evgnJQM, wdcvDisqus, obscureEmail */
var wdcv = (function () {    
    var data = {
        url: 'http://webdevelopercv.com/'
    };
    
    function init() {
        obscureEmail.init('tvgtulutnjgorkyqcmo');
    }
    
    return {
        init: init,
        data: data
    };
}());

$(function () {    
    wdcv.init();
});
