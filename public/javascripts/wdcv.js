/*global $, evgnJQM, wdcvDisqus */
var wdcv = (function () {    
    var data = {
        url: 'http://webdevelopercv.com/'
    };
    
    function init() {
        evgnJQM.init();              
    }
    
    return {
        init: init,
        data: data
    };
}());

$(function () {    
    wdcv.init();
});