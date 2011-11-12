/*global module, test, ok*/

var wdcvTest = (function () {
    function init() {                       
        module("wdcv-test.js: init");        
        test("ok", function () {            
            ok(true);            
        });                
    }
    
    return {
        init: init
    };
}());