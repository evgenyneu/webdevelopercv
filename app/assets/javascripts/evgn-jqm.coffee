class EvgnJQM
  constructor: ->
    _this = @
    $(document).on("mobileinit", ->
      $(document).on('pageshow', (event, ui) ->
        _this.showNotifications()
        try
          _gaq.push(['_trackPageview', $(this).data('url')]) if _gaq?
        catch error))

  showMessage: (message, isAlert = false, encodeMessage = true) ->
    message = zStr.htmlEncode(message) if encodeMessage

    html = JST["templates/jqm/message"]
      isAlert: isAlert
      message: message

    $(html).css({opacity: 0.96, display: "block"})
      .click(-> $(this).remove())
      .appendTo($.mobile.activePage)
      .delay(2000)
      .fadeOut 400, -> $(this).remove()

  showNotifications: ->
    $.mobile.hidePageLoadingMsg()
    $alertElement = $(".alert", $.mobile.activePage)
    alertText = $alertElement.html()
    $noticeElement = $(".notice", $.mobile.activePage)
    noticeText = $noticeElement.html()

    if $alertElement?
      $alertElement.remove()
      if alertText?
        @showMessage alertText, true
        return

    if $noticeElement?
      $noticeElement.remove()
      @showMessage(noticeText) if noticeText?

evgnJQM = new EvgnJQM()

