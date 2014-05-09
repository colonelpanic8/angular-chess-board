function segment(incoming, length) {
  var output = [];
  var current = [];
  _.each(incoming, function(element) {
    current.push(element);
    if(current.length < length) return;
    output.push(current);
    current = [];
  });
  if(current.length > 0) output.push(current);
  return output;
}

var pieceNameToCharacter = {
  k: "♔",
  K: "♚",
  q: "♕",
  Q: "♛",
  r: "♖",
  R: "♜",
  n: "♘",
  N: "♞",
  b: "♗",
  B: "♝",
  p: "♙",
  P: "♟"
}

angular.module('ChessGame').directive('chessBoard', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      chessGame: "=chessGame",
      cssClass: "=cssClass",
      squareSize: "=squareSize",
      inverted: "=inverted"
    },
    templateUrl: "board.html",
    link: function (scope, element, attrs) {
      scope.style = {
        width: (8 * scope.squareSize) + "px",
        height: (8 * scope.squareSize) + "px",
        position: "relative"
      }
      var chessGame = scope.chessGame;
      scope.currentSquare = null;
      scope.legalMoves = [];
      var Square = function (index, scope) {
        this.index = index;
        this.chessGame = chessGame;
        this.highlightColor = null;
        this.topLevelScope = scope;
      }
      Square.prototype = {size: scope.squareSize}
      Square.prototype.__defineGetter__('chessGame', function() {
        return this.topLevelScope.chessGame;
      })
      Square.prototype.__defineGetter__('piece', function() {
        return this.chessGame.getPiece(this.index);
      })
      Square.prototype.__defineGetter__('pieceCharacter', function() {
        if (this.piece) return pieceNameToCharacter[this.piece.getName()];
      });
      Square.prototype.__defineGetter__('rank', function () {
        return rankFromRaw(this.index);
      });
      Square.prototype.__defineGetter__('file', function () {
        return fileFromRaw(this.index);
      });
      Square.prototype.__defineGetter__('hasPiece', function () {
        return chessGame.getPiece(this.index).isEmpty;
      });
      Square.prototype.__defineGetter__('xPosition', function () {
        var multiplier = !scope.inverted ? this.file : (7 - this.file) ;
        return multiplier * this.size;
      });
      Square.prototype.__defineGetter__('yPosition', function () {
        var multiplier = !scope.inverted ? (7 - this.rank) : this.rank;
        return multiplier * this.size;
      });
      Square.prototype.__defineGetter__('isDark', function () {
        return (this.rank & 0x1) == (this.file & 0x1);
      });
      Square.prototype.__defineGetter__('currentPieceCanReach', function() {
        return _.contains(this.topLevelScope.legalMoves, this.index);
      });
      Square.prototype.__defineGetter__('style', function() {
        return {
          width: this.size + "px",
          height: this.size + "px",
          position: "absolute",
          left: this.xPosition + "px",
          top: this.yPosition + "px"
        }
      });
      Square.prototype.__defineGetter__('classes', function() {
        var classes = [this.isDark ? "dark-square" : "light-square"];
        if (this.currentPieceCanReach)
          classes.push("legal-move");
        return classes;
      });
      scope.squareSet = {
        squares: _.map(_.range(64), function(squareIndex) {
          return new Square(squareIndex, scope);
        }),
        clearHighlights: function() {
          _.each(this.squares, function(square) {
            square.highlightColor = null;
          });
        },
        setHighlight: function(index, highlightColor) {
          this.squares[index].highlightColor = highlightColor;
        },
        setNewHighlight: function() {
          this.clearHighlights();
          this.setHighlight.apply(this, arguments);
        }
      }
      scope.chessGame.addListener(scope.$apply.bind(scope));
    }
  }
}).directive('chessSquare', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {square: "=square"},
    templateUrl: "square.html",
    link: function (scope, element, attrs) {
      element.droppable({
        accept: function(draggable) {
          pieceScope = angular.element(draggable).scope();
          return scope.square.chessGame.isLegalMove(pieceScope.square.index,
                                                    scope.square.index);

        },
        drop: function(event, ui) {
          pieceScope = angular.element(event.toElement || event.relatedTarget).scope()
          if (pieceScope.square.piece instanceof Pawn && (scope.square.rank == 0 || scope.square.rank == 7)) {
            
          }
          
          if (scope.square.chessGame.makeMoveFromIndices(pieceScope.square.index,
                                                         scope.square.index)) {
            scope.$apply();
            pieceScope.$apply();
          }
        }
      })
    }
  }
}).directive('chessPiece', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {square: "=square"},
    templateUrl: 'piece.html',
    link: function (scope, element, attrs) {
      scope.topOffset = function() {
        return -scope.square.size * 1/4;
      }
      scope.style = {
        "font-size": scope.square.size + "px",
        position: "relative",
        top: scope.topOffset() + "px",
        cursor: "pointer"
      }
      element.draggable({zIndex: 999999})
      element.draggable({
        disable: false,
        revert: "invalid",
      }).draggable({
        start: function(event, ui) {
          scope.square.topLevelScope.currentSquare = scope.square;
          scope.square.topLevelScope.legalMoves = scope.square.chessGame.getLegalMovesRaw(scope.square.index);
          scope.square.topLevelScope.$apply();
        },
        stop: function(event, ui) {
          element.css("top", scope.topOffset() + "px");
          element.css("left", "0px");
          scope.square.topLevelScope.currentSquare = null;
          scope.square.topLevelScope.legalMoves = [];
          scope.square.topLevelScope.$apply();
        },
        drag: function(event, ui) {
        },
        deactivate: function(event, ui) {
        }
      });
    }
  }
}).directive('moveList', function() {
  function moveListController($scope, $attrs) {
    $scope.rewindTo = function(move) {
      if(move.algebraic === "...") return;
      this.chessGame.undoToMove(move);
    }
    $scope.updateMovePairs = function() {
      var moveList = $scope.chessGame.chessBoard.moves.slice(0);
      moveList.push({algebraic: "..."});
      $scope.movePairs = segment(moveList, 2);
    }
    $scope.chessGame.addListener($scope.updateMovePairs);
    $scope.updateMovePairs();
  }
  return {
    restrict: 'E',
    replace: true,
    templateUrl: "move_table.html",
    controller: moveListController
  }
});
