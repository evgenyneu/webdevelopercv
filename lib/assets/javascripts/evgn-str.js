/*
* Functions to format strings and prices, parse textboxes
*
* The source code is in the public domain, feel free to use it for any purpose.
*
* Evgeny Neumerzhitskiy
* http://webdevelopercv.com
*	
*/

/*global $ */

var zStr = (function () {        
    function pluralize(str, qty) {
        return str + ((qty > 1) ? "s" : "");
    }
    function isStringNullOrEmpty(str) {
        return str === undefined || str === "";
    }    
    function htmlEncode(value) {
        return $('<div/>').text(value).html();
    }    
    function htmlDecode(value) {
        return $('<div/>').html(value).text();
    }

    return {               
        isStringNullOrEmpty: isStringNullOrEmpty,
        pluralize: pluralize,
        htmlEncode: htmlEncode,
        htmlDecode: htmlDecode
    };
} ());