/*global $, wdcv, evgnJQM, window, disqus_shortname, DISQUS */
var wdcvDisqus = (function () {
    var isScriptLoaded = false,
        threadId = "disqus_thread";   

    function show($page) {                
        if (!$page.hasClass('posts-show-page')) {
            return;
        }
        
        var pageData = $page.data(),
            postId = pageData.postId,
            postPermalink = pageData.postPermalink;
         
        if (postId === undefined || postPermalink === undefined) {
            evgnJQM.showMessage('Error showing comments: postId or postPermalink is missing', true);
        }  
        
        $("#" + threadId).each(function () {
            var $disqus_thread = $(this),
                $parent = $disqus_thread.parents(".posts-show-page:first");            
            $disqus_thread.attr('id', threadId + $parent.attr('id'));
        });                
                    
        $("." + threadId, $page).attr('id', threadId);        
                                
        if (!isScriptLoaded) {
            window.disqus_identifier = postId;
            window.disqus_url = wdcv.data.url + postPermalink;
            $.getScript('http://' + disqus_shortname + '.disqus.com/embed.js', function () {
                isScriptLoaded = true;                
            });
            return;
        }
        
        DISQUS.reset({
                reload: true,
                config: function () {  
                    this.page.identifier = postId;  
                    this.page.url = wdcv.data.url + postPermalink;
                }
            });
    }

    return {
        show: show
    };
}());