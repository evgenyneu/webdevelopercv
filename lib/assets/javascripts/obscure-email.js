/*global $ */
var obscureEmail = (function () {    
    var repTav = [114, 97, 46, 113, 107, 105, 106, 64, 116, 101, 109, 111, 110, 117, 108, 121, 104, 32];
    function umboriagest(stringFrom) {
        var stringReturn = '',
            i,
            character,
            lowered,
            index,
            characterFinal;
        for (i = 0; i < stringFrom.length; i += 1) {
            character = stringFrom.charAt(i);
            lowered = character.toLowerCase();
            index = $.inArray(lowered.charCodeAt(0), repTav);
            if (index !== -1) {
                if (index % 2 === 0) {
                    index += 1;
                } else {
                    index -= 1;
                }
                characterFinal = String.fromCharCode(repTav[index]);
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
        $("a.Cmuercehot").on("click", function () {
            kufmjfkyoearusftaqcmo.call(this, cloghNott);
            return false;
        });
    }
    
    return {
        init: init
    };
}());
