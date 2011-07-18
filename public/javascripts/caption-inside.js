/*global $ */
var captionInside = (function () {
    function initCaptionInside($element) {
        var elementText = $element.data("caption");
        if (elementText === undefined || elementText === null || elementText === "") {
            return;
        }
        if ($element.val() === undefined || $element.val() === "" || $element.val() === elementText) {
            $element.val(elementText).addClass('humble');
        } else {
            $element.removeClass('humble');
        }
        return elementText;
    } 
    
    function getCaptionInsideElementValue($element) {
        if ($element.val() === $element.data("caption")) {
            return "";
        } else {
            return $element.val();
        }
    }
    
    function setCaptionInsideTrueValue($context) {
        $(".captionInside", $context).each(function () {
            $(this).val(getCaptionInsideElementValue($(this)));
        });
    }        
    
    function initElements($container) {
        $("form:has(input.captionInside)", $container).submit(function () {
            setCaptionInsideTrueValue($(this));
        });
        
        $("input.captionInside", $container).each(function () {            
            var $element = $(this),
                elementText = initCaptionInside($element);
            $element.focus(function () {
                var $element = $(this);
                if ($element.val() === elementText) {
                    $element.val("").removeClass('humble');
                }
            }).blur(function () {
                var $element = $(this);
                if ($.trim($element.val()) === "") {
                    $element.val(elementText).addClass('humble');
                }
            });
        });  
    }               
          
    return {
        initElements: initElements
    };
}());