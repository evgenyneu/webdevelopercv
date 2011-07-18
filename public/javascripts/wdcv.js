/*global $, evgnJQM, wdcvDisqus */
var wdcv = (function () {    
    var data = {
        url: 'http://webdevelopercv.com/'
    };
    
    function init() {
        evgnJQM.init();
        
        $('div.posts-show-page').live('pageshow', function (event, ui) {
            wdcvDisqus.show($(this));            
        });
    }
    
    return {
        init: init,
        data: data
    };
}());

var disqus_shortname = 'webdevelopersblog';

$(function () {    
    wdcv.init();
});