/*global $, window, navigator, setTimeout, alert, captionInside, zStr, _gaq */
var evgnJQM = (function () {
    var data = {
        isMobile: false
    };
    
    function mySlideToggle(show, duration, callback) {
        if (show) {
            this.slideDown(duration, callback);
        } else {
            this.slideUp(duration, callback);
        }       
    }
    
    function fixFixedToolbars() {
        $(window).scrollTop($(window).scrollTop() + 1);
        $(window).scrollTop($(window).scrollTop() - 1);   
    }
    
    function initElements($container) {        
        $("a.toBeImplemented", $container).click(function () {
            alert('To be implemented.');
            return false;
        });                

        captionInside.initElements($container);                  
    }
    
    function showMessage(message, isAlert, encodeMessage) {
        if (isAlert === undefined) {
            isAlert = false;
        }
        if (encodeMessage === undefined) {
            encodeMessage = true;
        }
        
        if (encodeMessage) {
            message = zStr.htmlEncode(message);
        }
               
        $("<div class='pageMessage ui-loader ui-overlay-shadow cursorPointer " + 
            (isAlert ? "ui-body-e" : "ui-body-d") + " ui-corner-all'><h1>" + message + "</h1></div>")
                .css({"display": "block", "opacity": 0.96, "top": $(window).scrollTop() + 100})
                .click(function () {
                    $(this).remove();
                })
                .appendTo($.mobile.activePage)
                .append("<span class='ui-icon ui-icon-delete ui-icon-shadow'></span>")
                .delay(3000)
                .fadeOut(400, function () {
                        $(this).remove();
                    });
    }
    
    function showNotifications() {
        $.mobile.hidePageLoadingMsg();      
                
        var $alertElement = $(".alert", $.mobile.activePage),
            alertText = $alertElement.html(),
            $noticeElement = $(".notice", $.mobile.activePage),
            noticeText = $noticeElement.html();  
        
        if ($alertElement !== null) {
            $alertElement.remove();
            if (alertText !== null) {
                showMessage(alertText, true);            
                return;
            }
        }
                  
        if ($noticeElement !== null) {
            $noticeElement.remove();
            if (noticeText !== null) {
                showMessage(noticeText);
            }
        }         
    }
        
    function init() {  
        $(document).bind("mobileinit", function () {
        });

        data.isMobile = /mobile/i.test(navigator.userAgent);
        $.fn.mySlideToggle = mySlideToggle;
        
        $('div').live('pagecreate', function (event, ui) {
            initElements($(this));            
        });   
        
        $('div').live('pageshow', function (event, ui) {            
            showNotifications.call(this);      
            try {
                if (typeof _gaq !== 'undefined' && _gaq !== null) {
                    _gaq.push(['_trackPageview', $(this).data('url')]);
                }
            } 
            catch (error) {
            }
        });                   
    }
    
    return {
        init: init,
        fixFixedToolbars: fixFixedToolbars,
        showMessage: showMessage
    };
}());
evgnJQM.init();
