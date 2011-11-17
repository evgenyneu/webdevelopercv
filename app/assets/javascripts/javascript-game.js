var diceGameEvg = (function() {
    var aColors = ['p_white', 'p_red', 'p_blue', 'p_green'],
    	chessBoardSides = ['bottom', 'left', 'top', 'right'],
    	$ch_outer = null,
    	$diceDlg = null,
        $dice = null,
    	$isTutorial = false,
    	players = [], //the player's opponents, contains playerClass objects
    	currentPlayerIndex = null, //the index of the player in 'players' array 
    	diceNumberThrown = 0, //The number that was thrown on the dice
    	aCheckWhoFirstColors = null,
    	whoGoesFirstResults = [], //array containing the results for 'who goes first' test. Contains {color:"",dice:0} objects

    	iRollDiceDelay = null, //number of milliseconds between the dice changes during the rolling
    	iDelayMax = 100,
    	throwSpeed = 1.15,
    	diceToRoll = null, //element for the dice being rolled
    	diceRollFunction = null,
    	diceNumbersHistory = [],
    	diceRollResultPredefined = null,
    	reminderDiceTimer = null,
	
    	piecesPositions = [], //positions of all pieces ralative to current player coordinates. Contains 'pieceOnBoard' objects
    	piecesCanMove = [],

    	reminderAnimationTimer = null,

    	pieceToMoveQueue = null,
    	positionToMoveQueue = null,

    	tutorialTextScrollAmount = 0,
    	tutorialScrollTimeout = null,
    	$tutorialScrollAminationElement = null,
    	tutorialPageNo = 0,
    	tutorialPieceMove = 3,
    	selectPieceDlgAnimationTimer = null,
	$selectPieceDlgTitle = null;


    function playerClass(color, side) {
        this.color = color;
        this.side = side;
        this.pieces = []; //contains the pieces, pieceClass objects
    }

    function pieceClass() {
        this.position = null; //the relative position of the piece on the board (from 0 to 31). If the piece is not in game it has negative position (from -1 to -4)
        this.element = null; //the DOM element for this piece     
    }

    function randOrd() {
        return (Math.round(Math.random()) - 0.5);
    }

    function GetMyColor() {
        if (players.length == 0) {
            return null;
        }
        return players[0].color;
    }

    //restart the application
    function InitDiceApp() {
        currentPlayerIndex = null;
        diceRollResultPredefined = null;
        $ch_outer.children(".piece").remove();
        $diceDlg.animate({ 'top': '-50px' }, '300');
        players = [];
        $ch_outer.find("#selectOpponentsDlg .piece").removeAttr('class').addClass('piece');
        $ch_outer.find("#whoGoesFirstShow").html('');
	$selectPieceDlgTitle = $('#selectPieceDlg .title',$ch_outer);
        whoGoesFirstResults = [];
        aCheckWhoFirstColors = null;
        piecesPositions = [];
        piecesCanMove = [];
        pieceToMoveQueue = null;
        positionToMoveQueue = null;
        $isTutorial = false;
        ScrollDialog('selectPieceDlg', startSelectPieceDlgAnimation);
    }

    function init() {
        if ($ch_outer != undefined) {
            return; //already initiated
        }
        $ch_outer = $("#ch_outer");
        $diceDlg = $ch_outer.children("#diceDialog");
        $dice = $diceDlg.children("div:first");
        $ch_outer.find("#selectPeices .hoverable").hover(
          function() {
              setPieceHoverImage($(this), true);
          },
          function() {
              setPieceHoverImage($(this), false);
          }
        ).click(function() {
            if (GetMyColor() != null) {
                return;
            }

	    stopSelectPieceDlgAnimation();

            var player = new playerClass();
            player.color = GetPieceColor($(this));
            player.side = "bottom";
            players.push(player);

            PlacePiecesInitially($(this), 'bottom', function() {
                SetOpponentsDialog();
                ScrollDialog('selectPieceDlg');
                ScrollDialog('selectOpponentsDlg');
            });
        });

        $ch_outer.find("#tutorialLink").click(function() {
            if (GetMyColor() != null) {
                return;
            }
            var player = new playerClass();
            player.color = 'p_white';
            player.side = "bottom";
            players.push(player);
            ScrollDialog('selectPieceDlg');
            StartTutorial();
            return false;
        });
        $ch_outer.find("#linkNext").click(function() {
            TutorialNewPage();
            return false;
        });


        $ch_outer.find("#play3Opponents, #play2Opponents, #play1Opponent").hover(
          function() {
              $(this).children(".piece").addClass("hoverable").each(function() {
                  setPieceHoverImage($(this), true);
              });
          },
          function() {
              $(this).children(".piece").removeClass("hoverable").each(function() {
                  setPieceHoverImage($(this), false);
              });
          }
        );

        $ch_outer.find("a.my_link").hover(function() {
            $(this).html('\u2192 ' + $(this).html() + ' \u2190');
        },
            function() {
                var strText = new String($(this).html());
                $(this).html(strText.substring(2, strText.length - 2));
            })
        $ch_outer.find("#gameOverDlg a").click(function() {
            ScrollDialog('gameOverDlg');
            InitDiceApp();
            return false;
        });

        InitDiceApp();

        $ch_outer.find("#selectOpponentsDlg > div").click(function() {
            if (players.length > 1) {
                return;
            }
            var numberOfOpponets = $(this).children(".piece").length;
            var chessSideShift = 0;
            if (numberOfOpponets == 1 || (numberOfOpponets == 2 && Math.random() > 0.5)) {
                chessSideShift = 1;
            }

            $(this).children(".piece").each(function(i) {
                var opponentSide = chessBoardSides[i + 1 + chessSideShift];
                var player = new playerClass();
                player.color = GetPieceColor($(this));
                player.side = opponentSide;
                players.push(player);

                PlacePiecesInitially($(this), opponentSide, (i == numberOfOpponets - 1) ? function() {
                    $ch_outer.children(".piece").css('zIndex', '10'); //make the pieces below the dialog
                    ScrollDialog("selectOpponentsDlg");
                    ScrollDialog('whoGoesFirstDlg', SetWhoGoesFirstDialog);
                } : null);
            });
        });
    }

    function startSelectPieceDlgAnimation() {
        stopSelectPieceDlgAnimation();
	selectPieceDlgAnimationTimer = setTimeout(function() {
           var color = "Red"; 
	   if ($selectPieceDlgTitle.hasClass('color-toggled') === true) 
	   { 
		   color = "Gray";
	   }
	   $selectPieceDlgTitle.css('color',color).toggleClass('color-toggled');
	   startSelectPieceDlgAnimation();
	}, 500);
    }

    function stopSelectPieceDlgAnimation() {
	if (selectPieceDlgAnimationTimer !== null){
	    clearTimeout(selectPieceDlgAnimationTimer);
	    selectPieceDlgAnimationTimer = null;
	}
    }

    function setPieceHoverImage($piece, isHover) {
        var x, y;
        if ($piece.hasClass("p_white")) {
            x = 0;
        } else if ($piece.hasClass("p_red")) {
            x = -25;
        } else if ($piece.hasClass("p_blue")) {
            x = -50;
        } else if ($piece.hasClass("p_green")) {
            x = -75;
        }
        if (isHover) {
            y = -25;
        } else {
            y = 0;
        }
        $piece.css({ backgroundPosition: x + "px " + y + "px" });
    }

    function GetPlayerIDByColor(color) {
        for (var i in players) {
            if (players[i].color == color) {
                return parseInt(i);
            }
        }
        return null;
    }

    function PlacePiecesInitially(oPiece, side, functionOnFinish) {
        var piecePosition = { top: 0, left: 0 };
        var outer = $ch_outer;
        piecePosition.top = $(oPiece).offset().top - outer.offset().top;
        piecePosition.left = $(oPiece).offset().left - outer.offset().left;
        var player = players[GetPlayerIDByColor(GetPieceColor(oPiece))];

        for (var iPosition = -1; iPosition > -5; iPosition--) {
            var newPiece = $("<div class='piece'></div>").addClass(GetPieceColor(oPiece));
            newPiece.css("left", piecePosition.left + 'px');
            newPiece.css("top", piecePosition.top + 'px');
            outer.append(newPiece);
            var positionOnBoard = GetPieceAbsolutePositionSquare(side, iPosition);
            var pieceNewPosition = GetPieceAbsolutePositionPixel(positionOnBoard);
            newPiece.animate({
                left: pieceNewPosition.left + "px",
                top: pieceNewPosition.top + "px"
            }, 700, null, iPosition == -4 ? functionOnFinish : null);

            //add the piece to player
            var piece = new pieceClass();
            piece.position = iPosition;
            piece.element = newPiece[0];
            newPiece.data("pieceIndex", player.pieces.length);
            player.pieces.push(piece);
            if (side == chessBoardSides[0]) {
                bindPieceHover(newPiece);
            }
        }
    }

    function bindPieceHover($piece) {
        $piece.hover(function() { $(this).addClass('hovered'); }, function() { $(this).removeClass('hovered'); });
    }

    //Show and hides the dialog
    function ScrollDialog(strDialogName, scrolledFunc) {
        var $dialog = $ch_outer.children("#" + strDialogName);
        var leftPosition = $dialog.position().left;
        if (leftPosition < 0) {
            //the dialog was already used. Return it to default position
            $ch_outer.children("#" + strDialogName).css('left', '250px');
        }
        $dialog.animate({ left: "-=217px" }, 1000, null, scrolledFunc);
    }

    //Returns the color of the piece
    function GetPieceColor(oElement) {
        for (var iColor in aColors) {
            if (oElement.hasClass(aColors[iColor])) {
                return aColors[iColor];
            }
        }
    }

    function SetOpponentsDialog() {
        var aOpponentColors = aColors.slice(0);

        aOpponentColors.sort(randOrd);
        aOpponentColors.splice(jQuery.inArray(GetMyColor(), aOpponentColors), 1);

        for (var i = 0; i < 3; i++) {
            $($ch_outer.find("#play3Opponents .piece")[i]).addClass(aOpponentColors[i]);
        }

        aOpponentColors.sort(randOrd);
        aOpponentColors.pop();
        for (var i = 0; i < 2; i++) {
            $($ch_outer.find("#play2Opponents .piece")[i]).addClass(aOpponentColors[i]);
        }

        aOpponentColors = aColors.slice(0);
        aOpponentColors.splice(jQuery.inArray(GetMyColor(), aOpponentColors), 1);
        $($ch_outer.find("#play1Opponent .piece")[0]).addClass(aOpponentColors[Math.floor(Math.random() * 3)]);
    }
    
    function SetWhoGoesFirstDialog() {
        aCheckWhoFirstColors = [];
        for (var i = 0; i < players.length; i++) {
            aCheckWhoFirstColors.push(players[i].color);
        }
        aCheckWhoFirstColors.sort(randOrd); //randomize the order of players on the dialog

        ShowGoesFirstDiceRoll();
    }

    function ShowGoesFirstDiceRoll() {
        if (whoGoesFirstResults.length > 0) {
            //Store the number thrown for previous player
            if (whoGoesFirstResults[whoGoesFirstResults.length - 1].dice == null) {
                whoGoesFirstResults[whoGoesFirstResults.length - 1].dice = diceNumberThrown;
            }
        } else {
            $ch_outer.find("#whoGoesFirstShow").html('');
        }

        if (aCheckWhoFirstColors.length == 0) {
            //all players finished throwing the dice. See who goes first
            whoGoesFirstResults.sort(function(a, b) {
                return b.dice - a.dice;
            });
            var iCnt = whoGoesFirstResults.length;
            for (var i = 1; i < iCnt; i++) {
                if (whoGoesFirstResults[whoGoesFirstResults.length - 1].dice < whoGoesFirstResults[0].dice) {
                    whoGoesFirstResults.pop();
                }
            }

            if (whoGoesFirstResults.length > 1) {
                //players have the same largest dice numbers, they roll the dice again
                for (var i = 0; i < whoGoesFirstResults.length; i++) {
                    aCheckWhoFirstColors.push(whoGoesFirstResults[i].color);
                    bounceAnimate($ch_outer.find("#whoGoesFirstShow ." + whoGoesFirstResults[i].color), null, null, null, null, (i == whoGoesFirstResults.length - 1) ? ShowGoesFirstDiceRoll : null);
                }
                aCheckWhoFirstColors.sort(randOrd);
                whoGoesFirstResults = [];

            } else {
                currentPlayerIndex = GetPlayerIDByColor(whoGoesFirstResults[0].color);
                bounceAnimate($ch_outer.find("#whoGoesFirstShow ." + whoGoesFirstResults[0].color), null, null, null, null, startGame);
            }

            return;
        }
        var t = $("<div class='whoGoesFirstPlayer'><div class='piece'></div><div class='dice'></div></div>");
        t.children('.piece').addClass(aCheckWhoFirstColors[0]);
        $ch_outer.find("#whoGoesFirstShow").append(t);
        whoGoesFirstResults.push({ color: aCheckWhoFirstColors[0], dice: null });
        var isMyDice = aCheckWhoFirstColors[0] == GetMyColor();
        aCheckWhoFirstColors.shift();
        rollDice(t.children('.dice'), ShowGoesFirstDiceRoll, isMyDice);
    }
    
    function bounceAnimate(elemetsToBounce, changeProperty, bounceAnimationSpeed, bounceAnimationTime, bounceAnimationShift, onFinished, additionalAnimation) {
        if (bounceAnimationSpeed == undefined) {
            bounceAnimationSpeed = 100; //speed of 'bounce' animation
        }
        if (bounceAnimationShift == undefined) {
            bounceAnimationShift = 3; //The bounce shift
        }
        if (bounceAnimationTime == undefined) {
            bounceAnimationTime = 1500;
        }
        if (changeProperty == undefined) {
            changeProperty = "marginTop";
        }
        var properties = changeProperty.split(',');
        var animationScript = "elemetsToBounce";
        var animationLoopCount = Math.floor(bounceAnimationTime / bounceAnimationSpeed / 2) * 2;
        for (var i = 0; i < animationLoopCount; i++) {
            if (i == 1) {
                bounceAnimationShift *= 2;
            }
            if (i == animationLoopCount - 1) {
                bounceAnimationShift /= 2;
            }
            animationScript += ".animate({ ";
            for (var iProperty = 0; iProperty < properties.length; iProperty++) {
                if (iProperty > 0) {
                    animationScript += ",";
                }
                animationScript += properties[iProperty] + ": '" + (i % 2 == 0 ? "-" : "+") + "=" + bounceAnimationShift + "px' ";
            }
            animationScript += "}, " + bounceAnimationSpeed;
            if (onFinished != undefined && i == animationLoopCount - 1) {
                animationScript += ",null," + onFinished;
            }
            animationScript += ")";
        }
        if (additionalAnimation != undefined) {
            animationScript += additionalAnimation;
        }

        eval(animationScript);
    }
    
    function rollDice(diceElement, onFinishedFunc, isMyDice) {
        if (diceElement != null) {
            //start rolling
            diceToRoll = diceElement;
            iRollDiceDelay = 30 + Math.floor(Math.random() * 40);
            iDelayMax = 100 + Math.floor(Math.random() * 100);
            if ($isTutorial == true) {
                diceRollResultPredefined = 6;
                iDelayMax += 300;
            }
            throwSpeed = 1.10 + Math.random() / 5;
            diceRollFunction = onFinishedFunc;
            diceNumbersHistory = [];
            if (isMyDice) {
                reminderDiceTimer = setInterval(reminderDice, 5000);
                diceToRoll.removeAttr('class').addClass('dice').addClass('dice_q').addClass('hoverable')
                    .hover(
                      function() {
                          $(this).addClass("hovered");
                      },
                      function() {

                          $(this).removeClass("hovered");
                      }
                    )
                    .one('click', function() {
                        clearInterval(reminderDiceTimer);
                        reminderDiceTimer = null;
                        $(this).unbind('mouseenter mouseleave');
                        rollDice();
                    });
                return;
            }
        } else {
            iRollDiceDelay *= throwSpeed;
        }
        GenerateDiceRandomNumber();
        diceToRoll.removeAttr('class').addClass('dice').addClass('dice_' + diceNumberThrown);

        if (iRollDiceDelay < iDelayMax) {
            setTimeout(function () {
		rollDice();
	    }, iRollDiceDelay);
        } else {
            if (diceRollResultPredefined != null) {
                diceToRoll.removeAttr('class').addClass('dice').addClass('dice_' + diceRollResultPredefined);
            }

            //Finished
            setTimeout(diceRollFunction, (currentPlayerIndex == 0 ? 0 : 1000));
        }
    }

    function reminderDice() {
        bounceAnimate(diceToRoll);
    }

    function GenerateDiceRandomNumber() {
        //get random thrown number for the dice
        var iNumberThrownNew = Math.floor(Math.random() * 6) + 1;
        if (jQuery.inArray(iNumberThrownNew, diceNumbersHistory) == -1) {
            if (diceNumbersHistory.length == 2) {
                diceNumbersHistory.pop();
            }
            diceNumbersHistory.unshift(iNumberThrownNew);
            diceNumberThrown = iNumberThrownNew;
        }
        else {
            GenerateDiceRandomNumber();
        }
    }

    //------------------THE GAME---------------------

    function startGame() {
        if (players.length > 0) {
            ScrollDialog('whoGoesFirstDlg', PlayerGo);
        }
    }

    function IsMyTurn() {
        return currentPlayerIndex == 0;
    }

    function RollGameDice() {
        rollDice($dice, PlayerTurnDiceRolled, IsMyTurn());
    }

    //checks if the game is over
    function CheckWin() {
        for (var iPlayer in players) {
            var player = players[iPlayer];
            var bPlayerWin = true;
            for (var iPiece in player.pieces) {
                var piece = player.pieces[iPiece];
                if (piece.position < 28) {
                    bPlayerWin = false;
                }
            }
            if (bPlayerWin) {
                var gameOverDlg = $ch_outer.find("#gameOverDlg");
                currentPlayerIndex = iPlayer;
                bounceAnimate($ch_outer.children("." + player.color + ":odd"), null, null, 30000);
                bounceAnimate($ch_outer.children("." + player.color + ":even"), null, 120, 30000);
                if (currentPlayerIndex == 0) {
                    //the human wins
                    gameOverDlg.children("#opponnetWins").hide();
                    gameOverDlg.children("#youWin").show();
                } else {
                    //machine wins
                    gameOverDlg.find("#opponnetWins > .piece").removeAttr('class').addClass('piece ' + player.color);
                    gameOverDlg.children("#opponnetWins").show();
                    gameOverDlg.children("#youWin").hide();
                }
                setTimeout(function () {
		    ScrollDialog('gameOverDlg');
		}, 3000);
                return true;
            }
        }
        return false;
    }

    function PlayerGo() {
        if (CheckWin()) {
            return;
        }
        //Show dice
        var position = { top: 6, left: 4 };
        switch (players[currentPlayerIndex].side) {
            case 'top':
                position.left = 4;
                position.top = 2;
                break;
            case 'left':
                position.left = 2;
                position.top = 4;
                break;
            case 'right':
                position.left = 6;
                position.top = 4;
                break;
        }
        var diceDialogPosition = GetPieceAbsolutePositionPixel(position);
        diceDialogPosition.top += 5;
        diceDialogPosition.left += 5;
        var currentPosition = $diceDlg.position();
        if (currentPosition.top == diceDialogPosition.top && currentPosition.left == diceDialogPosition.left) {
            //the dice is already in place
            RollGameDice();
        } else {
            //move the dice to the player's side
            $diceDlg.animate({ 'left': diceDialogPosition.left + 'px', 'top': diceDialogPosition.top + 'px' }, 400, null, RollGameDice)
        }
    }

    function pieceOnBoard(player, piece) {
        this.player = player;
        this.piece = piece;
    }
    
    function PlayerTurnDiceRolled() {
        //check which pieces can move
        piecesCanMove = [];

        //Get the positions of all pieces ralative to current player coordinates
        piecesPositions = new Array(29);
        for (iPlayer in players) {
            var player = players[iPlayer];
            for (var iPiece in player.pieces) {
                var piece = player.pieces[iPiece];
                if (piece.position >= 0) {
                    var piecePositionForCurrentPlayer = piece.position;
                    if (iPlayer != currentPlayerIndex) {//the opponent's piece
                        if (piece.position > 28) {
                            continue; //opponent's piece is out of reach
                        }
                        //get the position of the piece
                        //relative to the current player's coordinates
                        var currentSideIndex = jQuery.inArray(players[currentPlayerIndex].side, chessBoardSides);
                        var playerSideIndex = jQuery.inArray(player.side, chessBoardSides);
                        if (currentSideIndex > playerSideIndex) {
                            playerSideIndex += 4;
                        }
                        var positionDiff = playerSideIndex - currentSideIndex;
                        piecePositionForCurrentPlayer = positionDiff * 7 + piece.position;
                        if (piecePositionForCurrentPlayer > 28) {
                            piecePositionForCurrentPlayer -= 28;
                        }
                    }

                    piecesPositions[piecePositionForCurrentPlayer] = new pieceOnBoard(player, piece);

                    //assign to both 0 and 28 because they overlap
                    if (piecePositionForCurrentPlayer == 28) {
                        piecesPositions[0] = piecesPositions[piecePositionForCurrentPlayer];
                    } else if (piecePositionForCurrentPlayer == 0) {
                        piecesPositions[28] = piecesPositions[piecePositionForCurrentPlayer];
                    }
                }
            }
        }

        var currentPlayer = players[currentPlayerIndex];

        //go through all the player's piece and see which can move
        for (iPiece in currentPlayer.pieces) {
            var piece = currentPlayer.pieces[iPiece];
            if (piece.position < 0) {
                //check if we can move a new piece into the game
                if (diceNumberThrown == 6 && (piecesPositions[0] == undefined || piecesPositions[0].player.color != currentPlayer.color)) {
                    piecesCanMove.push(piece);
                    continue;
                }
            } else {
                var iPieceNewPosition = piece.position + diceNumberThrown;
                if (iPieceNewPosition > 31) {
                    continue;
                }
                //check if there is a piece in the way
                var pieceInTheWay = false;
                for (var iPosition = piece.position + 1; iPosition < iPieceNewPosition; iPosition++) {
                    if (piecesPositions[iPosition] != undefined) {
                        pieceInTheWay = true;
                        break;
                    }
                }
                if (pieceInTheWay) {
                    continue;
                }
                if (piecesPositions[iPieceNewPosition] == undefined || piecesPositions[iPieceNewPosition].player.color != currentPlayer.color) {
                    piecesCanMove.push(piece);
                    continue;
                }
            }
        }

        if (piecesCanMove.length == 0) {
            //Current player can not move, take turns
            setTimeout(PlayerGo, currentPlayerIndex == 0 ? 1000 : 0);
            currentPlayerIndex += 1;
            if (currentPlayerIndex > players.length - 1) {
                currentPlayerIndex = 0;
            }

            return;
        } else {
            if (IsMyTurn()) {
                //make the piece that can move clickable
                reminderAnimationTimer = setInterval(reminderAnimation, 5000);
                for (var iPiece in piecesCanMove) {
                    var piece = piecesCanMove[iPiece];
                    $(piece.element).addClass('hoverable').hover(
                          function() {
                              setPieceHoverImage($(this), true);
                          },
                          function() {
                              setPieceHoverImage($(this), false);
                          }
                        )
                        .one('click', function() {
                            clearInterval(reminderAnimationTimer);
                            reminderAnimationTimer = null;
                            var piece = GetPieceForElement(this);
                            $ch_outer.children("." + players[0].color).removeClass('hoverable').css('cursor', '').unbind('mouseenter mouseleave').unbind('click').each(function() {
                                setPieceHoverImage($(this), false);
                                bindPieceHover($(this));
                            });
                            MovePiece(piece);
                        });
                    if ($(piece.element).hasClass('hovered')) {
                        setPieceHoverImage($(piece.element), $(piece.element).hasClass('hovered'));
                        $(piece.element).css('cursor', 'pointer');
                    }
                }
            } else {
                var oAI = new aiClass();
                MovePiece(oAI.decideMove());
            }
        }
    }

    //-------------- AI ------------------
    function aiClass() {
        /*
        The list of move choices that can be made by an opponent.
        'new' - new piece is put into game or move from first square
        'capture' - capture opponent
        'finish' - move piece to a diagonal square 
        'save' - run away from an opponent's piece to avoid being captured during the next opponent's move.
        'new_limit' - the value indicates the number of pieces in play when new piece is not moved (there are too many pieces already)
        */
        var playerChoices = {
            p_green: { 'new': 10, 'capture': 20, finish: 90, 'save': 60, 'new_limit': 2 },
            p_red: { 'new': 10, 'capture': 90, finish: 50, 'save': 20, 'new_limit': 3 },
            p_white: { 'new': 60, 'capture': 80, finish: 90, 'save': 20, 'new_limit': 4 },
            p_blue: { 'new': 10, 'capture': 60, finish: 80, 'save': 50, 'new_limit': 1 }
        };

        this.decideMove = function() {
            this.collectPiecesData();
            piecesCanMove.sort(function(a, b) {
                if (a.moveWeight != b.moveWeight) {
                    return b.moveWeight - a.moveWeight;
                } else {
                    return ((Math.random() > 0.2) ? b.position - a.position : a.position - b.position);
                }
            });
            return piecesCanMove[0];
        }

        function AddDecisionWeight(position, choice, weight) {
            var player = players[currentPlayerIndex];
            for (var i in piecesCanMove) {
                var piece = piecesCanMove[i];
                if (position == piece.position) {
                    if (choice != undefined) {
                        weight = parseInt(playerChoices[player.color][choice])
                    }
                    piece.moveWeight += Math.floor(weight * Math.random());
                    break;
                }
            }
        }

        this.collectPiecesData = function() {
            var currentPlayer = players[currentPlayerIndex];
            var bHasNew = false;
            for (var iPiece in piecesCanMove) {
                var piece = piecesCanMove[iPiece];
                piece['moveWeight'] = 0;

                //new
                if (piece.position <= 0) {
                    var piecesInPlay = 0; //calculate the number of pieces already in play
                    if (piece.position < 0) {
                        for (var iPieceInPlay in currentPlayer.pieces) {
                            if (currentPlayer.pieces[iPieceInPlay].position > 0 && currentPlayer.pieces[iPieceInPlay].position < 29) {
                                piecesInPlay++;
                            }
                        }
                        if (piecesInPlay >= playerChoices[currentPlayer.color].new_limit) {
                            AddDecisionWeight(piece.position, null, -30);
                            bHasNew = true;
                        }
                    }

                    if (!bHasNew) {
                        AddDecisionWeight(piece.position, 'new');
                    }
                    bHasNew = true;
                }

                //capture
                if ((piece.position >= 0 && piecesPositions[piece.position + diceNumberThrown] != undefined) ||
                    (piece.position < 0 && piecesPositions[0] != undefined)) {
                    AddDecisionWeight(piece.position, 'capture');
                }

                //finish
                if ((piece.position + diceNumberThrown) > 28) {
                    AddDecisionWeight(piece.position, 'finish');
                }

                //save
                if (piece.position >= 0) {
                    for (var iPos = piece.position - 1; iPos >= (piece.position - 6); iPos--) {
                        var iPosActual = iPos
                        if (iPos < 0) {
                            iPosActual = 28 + iPos;
                        }
                        if (piecesPositions[iPosActual] == null) {
                            continue;
                        }

                        var pieceBefore = piecesPositions[iPosActual];
                        if (pieceBefore.player.color != players[currentPlayerIndex].color) {
                            if ((Math.floor(piece.position / 7) != Math.floor(iPosActual / 7) && piece.position % 7 != 0) || iPosActual % 7 == 0) {
                                //check if the previous opponent's piece will go diagonally, thus not be able to capture us
                                if (pieceBefore.piece.position > 23) {
                                    break;
                                }
                            }

                            AddDecisionWeight(piece.position, 'save');
                        }
                        break;
                    }
                    //check if we are on the opponent's corner - so there is a threat of being captured by new piece
                    if (piece.position > 0 && piece.position < 28 && piece.position % 7 == 0) {
                        var vSide = jQuery.inArray(players[currentPlayerIndex].side, chessBoardSides);
                        vSide += Math.floor(piece.position / 7);

                        if (vSide > 3) {
                            vSide = vSide % 4;
                        }
                        for (var iPlayer in players) {
                            var playerOpponent = players[iPlayer];
                            if (playerOpponent.side == chessBoardSides[vSide] && playerOpponent.pieces[GetLowestPieceIndex(playerOpponent)].position < 0) {
                                AddDecisionWeight(piece.position, 'save');
                                break;
                            }
                        }
                    }
                }
            }
        };
    }
    //------------------------------------

    function reminderAnimation() {
        var arrayElementsToAnimate = [];
        for (var iPiece in piecesCanMove) {
            var piece = piecesCanMove[iPiece];
            arrayElementsToAnimate.push(piece.element);
        }
        bounceAnimate($(arrayElementsToAnimate));
    }

    function MovePieceAnimate(pieceVar, side, newPosition, onFinishFunction, bounceBeforeMove) {
        if (pieceVar == undefined || side == undefined) {
            pieceVar = pieceToMoveQueue;
            side = GetPlayerForElement(pieceVar.element).side;
            newPosition = positionToMoveQueue;
            if ($isTutorial == true) {
                onFinishFunction = TutorialAnimationFinished;
            } else {
                onFinishFunction = PlayerGo;
            }
        }
        if (pieceVar.position >= 0 && newPosition >= 0 && Math.floor(pieceVar.position / 7) != Math.floor(newPosition / 7) && newPosition % 7 != 0) {
            var positionInBetween = Math.floor(newPosition / 7) * 7;
            MovePieceAnimate(pieceVar, side, positionInBetween, MovePieceAnimate);
            return;
        }
        var moveDistance = newPosition - pieceVar.position;

        var absoluteSqPositionOld = GetPieceAbsolutePositionSquare(side, pieceVar.position);

        pieceVar.position = newPosition;
        var absoluteSqPositionNew = GetPieceAbsolutePositionSquare(side, pieceVar.position);
        if (newPosition < 0) {
            moveDistance = Math.sqrt(Math.pow(absoluteSqPositionOld.top - absoluteSqPositionNew.top, 2) + Math.pow(absoluteSqPositionOld.left - absoluteSqPositionNew.left, 2));
        }
        var animationTime = Math.ceil(((moveDistance + 4) * 0.6) * 100);

        absoluteSqPosition = GetPieceAbsolutePositionPixel(absoluteSqPositionNew);
        var animationCode = ".animate({ left: '" + absoluteSqPosition.left + "px', top: '" + absoluteSqPosition.top + "px' }, " + animationTime + ", null, null); ";
        $ch_outer.children(".piece").css('zIndex', '10');
        $(pieceVar.element).css('zIndex', '50'); //make the moving piece above all other pieces
        if (bounceBeforeMove == true) {
            var bounceAnimationTime = 1000;
            animationTime += bounceAnimationTime;
            bounceAnimate($(pieceVar.element), null, null, bounceAnimationTime, null, null, animationCode);
        } else {
            animationCode = "$(pieceVar.element)" + animationCode;
            eval(animationCode);
        }
        if (onFinishFunction != undefined) {
            setTimeout(onFinishFunction, animationTime - animationTime / 4);
        }
    }
    
    //returns pieceClass object for the html element
    function GetPieceForElement(pieceElement) {
        return GetPlayerForElement(pieceElement).pieces[$(pieceElement).data("pieceIndex")];
    }

    function GetPlayerForElement(pieceElement) {
        return players[GetPlayerIDByColor(GetPieceColor($(pieceElement)))];
    }

    function MovePiece(piece) {
        var currentPlayer = players[currentPlayerIndex];
        if (piece.position < 0) {
            //clicked a not-in-game piece, place the leftmost one on board
            var indexLowestPiece = GetLowestPieceIndex(currentPlayer);
            pieceToMoveQueue = currentPlayer.pieces[indexLowestPiece];
            positionToMoveQueue = 0;
        } else {
            var newPosition = piece.position + diceNumberThrown;
            pieceToMoveQueue = piece;
            positionToMoveQueue = newPosition;
        }
        CaptureOpponnets();
    }

    //The functions captures opponent's piece if possible
    function CaptureOpponnets() {
        if (piecesPositions[positionToMoveQueue] == undefined) {
            MovePieceAnimate();
            if (diceNumberThrown < 6) {
                currentPlayerIndex += 1;
                if (currentPlayerIndex > players.length - 1) {
                    currentPlayerIndex = 0;
                }
            }
            return false;
        }
        var opponentsPiece = piecesPositions[positionToMoveQueue].piece;
        var opponent = piecesPositions[positionToMoveQueue].player;
        var positionToReturn = opponent.pieces[GetLowestPieceIndex(opponent)].position;
        if (positionToReturn >= 0) {
            positionToReturn = 0;
        }
        positionToReturn -= 1;

        MovePieceAnimate(opponentsPiece, opponent.side, positionToReturn, MovePieceAnimate, true);
        return true;
    }
    
    function GetLowestPieceIndex(player) {
        var iIndex = null;
        var iLowestPos = 100;
        for (var i in player.pieces) {
            if (player.pieces[i].position < iLowestPos) {
                iIndex = i;
                iLowestPos = player.pieces[i].position;
            }
        }
        return iIndex;
    }

    function GetPieceAbsolutePositionSquare(side, relativePosition) {
        var position = { top: null, left: null };
        if (relativePosition < 0) {
            position.top = 9;
            position.left = 10 + relativePosition;
        } else if (relativePosition < 7) {
            position.top = 8;
            position.left = 8 - relativePosition;
        } else if (relativePosition >= 7 && relativePosition < 29) {
            var iSideIndex = jQuery.inArray(side, chessBoardSides);
            iSideIndex += Math.floor(relativePosition / 7);
            iSideIndex %= 4;
            position = GetPieceAbsolutePositionSquare(chessBoardSides[iSideIndex], relativePosition % 7);
            return position;
        } else if (relativePosition >= 28) {
            position.top = 36 - relativePosition;
            position.left = 36 - relativePosition;
        }

        position = RotateChessBoard(position, side);
        return position;
    }

    //returns the position for the peice on the chess board, where xSquare and ySquare are the chess board square numbers from left to right and from top to down 
    function GetPieceAbsolutePositionPixel(position) {
        position.top = position.top * 25;
        position.left = position.left * 25;
        return position;
    }

    // function returns the position of the square as if the board
    // was rotated clockwise and bottom side bacame 'rotateBottomSideTo'
    function RotateChessBoard(position, rotateBottomSideTo) {
        switch (rotateBottomSideTo) {
            case 'top':
                position.top = 9 - position.top;
                position.left = 9 - position.left;
                break;
            case 'left':
                var TStore = position.left;
                position.left = 9 - position.top;
                position.top = TStore;
                break;
            case 'right':
                var TStore = position.top;
                position.top = 9 - position.left;
                position.left = TStore;
                break;
        }
        return position;
    }

    //-----------------THE TUTORIAL--------------------

    function StartTutorial() {
        $ch_outer.find("#tutorial1").show();
        tutorialPageNo = 0;
        tutorialPieceMove = 3;
        tutorialChangeLink('Next');
        tutorialScrollTimeout = null;
        $ch_outer.find("#tutorialViewWinow > div").css('marginTop', '0');
        $isTutorial = true;
        $tutorialScrollAminationElement = null;
        ScrollDialog('tutorialDlg');
        TutorialNewPage();
    }

    function ScrollTutorialText() {
        $tutorialScrollAminationElement = $ch_outer.find("#tutorial" + tutorialPageNo);
        $tutorialScrollAminationElement.animate({ 'marginTop': tutorialTextScrollAmount + 'px' }, Math.abs(tutorialTextScrollAmount) * 50, 'linear')
    }

    function TutorialNewPage() {
        tutorialPageNo++;
        if ($tutorialScrollAminationElement != null) {
            $tutorialScrollAminationElement.stop(false, false);
            $tutorialScrollAminationElement = null;
        }
        if (tutorialScrollTimeout != null) {
            clearTimeout(tutorialScrollTimeout);
            tutorialScrollTimeout = null;
        }

        if (tutorialPageNo > 1) {
            var IE7 = (navigator.appVersion.indexOf("MSIE 7.") == -1) ? false : true;
            if (IE7) {
                $ch_outer.find("#tutorial" + (tutorialPageNo - 1)).hide();
            } else {
                $ch_outer.find("#tutorial" + (tutorialPageNo - 1)).slideUp('normal');
            }
        }

        if (tutorialPageNo == 6) {
            tutorialPieceMove--;
            $ch_outer.find("#tutorialDlg").hide();
            tutorialMoveToCorner();
            return;
        }

        if (tutorialPageNo == 9) {
            ScrollDialog('tutorialDlg');
            InitDiceApp();
            return;
        }

        var $tutorialText = $ch_outer.find("#tutorial" + tutorialPageNo);
        $tutorialText.show();

        var textHeight = $tutorialText.height();
        var windowHeight = $ch_outer.find("#tutorialViewWinow").height();
        if (textHeight > windowHeight) {
            //The text does not fit the window - scroll it
            tutorialTextScrollAmount = windowHeight - textHeight;
            tutorialScrollTimeout = setTimeout(function() {
	        ScrollTutorialText();
	    }, 2000);
        }

        if (tutorialPageNo == 2) {
            for (var i = 0; i < 2; i++) {
                var player = new playerClass();
                player.color = aColors[i];
                player.side = chessBoardSides[i * 2];
                players.push(player);

                var pieceT = $ch_outer.find("#tutorialDlg .piece").removeAttr('class').addClass('piece').addClass(player.color);
                PlacePiecesInitially($(pieceT), player.side);
            }
        }
        if (tutorialPageNo == 3) {
            $ch_outer.find("#linkNext").hide();
            rollDice($tutorialText.children(".dice"), tutorialMoveToCorner, false);
        }
        if (tutorialPageNo == 4) {
            $ch_outer.find("#linkNext").hide();
            pieceToMoveQueue = GetTutorialPiece(tutorialPieceMove);
            positionToMoveQueue = 5;
            MovePieceAnimate();
        }
        if (tutorialPageNo == 5) {
            tutorialChangeLink('Show Me');
        }

        if (tutorialPageNo == 7) {
            $ch_outer.find('#tutorialDlg').show()
            tutorialChangeLink('Next');
        }

        if (tutorialPageNo == 8) {
            tutorialChangeLink('Start Game');
        }
    }

    function tutorialChangeLink(linkText) {
        $ch_outer.find("#linkNext").unbind('mouseenter mouseleave').html(linkText)
            .hover(function() {
                $(this).html('\u2192 ' + linkText + ' \u2190');
            },
            function() {
                $(this).html(linkText);
            })
    }

    function GetTutorialPiece(iNumber) {
        var currentPlayer = players[0];
        return currentPlayer.pieces[iNumber];
    }

    function TutorialAnimationFinished() {
        if (tutorialPageNo == 3) {
            $ch_outer.find("#linkNext").show();
        }
        if (tutorialPageNo == 4 || tutorialPageNo == 6) {
            var positionToReach = 28 + tutorialPieceMove;
            if (positionToMoveQueue < positionToReach) {
                positionToMoveQueue += Math.floor(Math.random() * 3) + 4;
                if (positionToMoveQueue > positionToReach) {
                    positionToMoveQueue = positionToReach;
                }
                MovePieceAnimate();
            } else {
                if (tutorialPageNo == 4) {
                    $ch_outer.find("#linkNext").show();
                } else {
                    if (tutorialPieceMove > 0) {
                        tutorialPieceMove--;
                        tutorialMoveToCorner();
                    } else {
                        setTimeout(function () {
			    TutorialNewPage();
			}, 3000);
                    }
                }
            }
        }
    }

    function tutorialMoveToCorner() {
        var currentPlayer = players[0];
        var indexLowestPiece = GetLowestPieceIndex(currentPlayer);
        pieceToMoveQueue = currentPlayer.pieces[tutorialPieceMove];
        positionToMoveQueue = 0;
        MovePieceAnimate();
    }

  return {
	  init: init
  };
}());


