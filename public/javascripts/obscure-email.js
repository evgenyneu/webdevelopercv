/*global $ */
var obscureEmail = (function () {    
    var repTav = [114, 97, 46, 113, 107, 105, 106, 64, 116, 101, 109, 111, 110, 117, 108, 121, 104, 32];
    function umboriagest(stringFrom) {
        var stringReturn = '';
        var i;
        for (i = 0; i < stringFrom.length; i++) {
            var character = stringFrom.charAt(i);
            var lowered = character.toLowerCase();
            var index = $.inArray(lowered.charCodeAt(0), repTav);
            if (index !== -1) {
                if (index % 2 === 0) {
                    index++;
                } else {
                    index--;
                }
                var characterFinal = String.fromCharCode(repTav[index]);
                if (lowered !== character) {
                    characterFinal = characterFinal.toUpperCase();
                }
                stringReturn += characterFinal;
            } else {

                stringReturn += character;
            }
        }
        return stringReturn;
    }
    
    function kufmjfkyoearusftaqcmo(kloghNott) {
        var friendlyName = umboriagest(kloghNott);        
        $(this).html(friendlyName).attr('href', umboriagest('orkyem:') + friendlyName);
    }
    
    function init(cloghNott) {
        $("a.Cmuercehot").live("click", function () {
            kufmjfkyoearusftaqcmo.call(this, cloghNott);
            return false;
        });
    }
    
    return {
        init: init
    };
}());