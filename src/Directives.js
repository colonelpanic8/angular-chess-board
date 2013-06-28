function segment(incoming, length) {
  var output = [];
  var current = [];
  _.each(incoming, function(element) {
    if(current.length < length - 1) return current.push(element);
    current.push(element);
    output.push(current);
    current = [];
  });
  if(current.length > 0) output.push(current);
  return output;
}

var pieceNameToImage = {
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

var tableTemplate = '<table><th class="movePair">#</th>';
tableTemplate += '<th class="movePair">White <br> &#9817;</th><th class="movePair">Black <br> &#9823;</th>'
tableTemplate += '<tr class="movePair" ng-repeat="movePair in movePairs">'
tableTemplate += '<td>{{ $index + 1 }}</td>';
tableTemplate += '<td><a ng-click="rewindTo(movePair[0])">{{ movePair[0].algebraic }}</a></td>'
tableTemplate += '<td><a ng-click="rewindTo(movePair[1])">{{ movePair[1].algebraic }}</a></td>'
tableTemplate += '</tr></table>'

angular.module('ChessGame').directive('ngChessBoard', function () {
  function chessBoardController($scope, $attrs) {
    $scope.squareSize = $attrs.squareSize;
    var chessGame = $scope.chessGame;
    var Square = function (index, chessGame) {
      this.index = index;
      this.chessGame = chessGame;
    }
    Square.prototype = {
      size: $attrs.squareSize,
      lightColor: $attrs.lightColor,
      darkColor: $attrs.darkColor,
      getPieceImage: function() {
        piece = this.chessGame.getPiece(this.index);
        if (piece) return pieceNameToImage[piece.getName()];
        return null;
      }
    }
    Square.prototype.__defineGetter__('rank', function () {
      return rankFromRaw(this.index);
    });
    Square.prototype.__defineGetter__('file', function () {
      return fileFromRaw(this.index);
    });
    Square.prototype.__defineGetter__('xPosition', function () {
      return this.file * this.size;
    });
    Square.prototype.__defineGetter__('yPosition', function () {
      return (7 - this.rank) * this.size;
    });
    Square.prototype.__defineGetter__('color', function () {
      return (this.rank & 0x1) == (this.file & 0x1) ?
        this.lightColor : this.darkColor;
    });
    $scope.squares = _.map(_.range(64), function(squareIndex) {
      return new Square(squareIndex, chessGame);
    });
    $scope.chessGame.addListener($scope.$apply.bind($scope));
  }
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="chess-board" style="width: {{8 * squareSize}}px; height: {{8 * squareSize}}px; position: relative;"><ng-chess-square square="square" ng-repeat="square in squares"><div>',
    controller: chessBoardController
  }
}).directive('ngChessSquare', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      square: "=square"
    },
    template: '<div style="width: {{ square.size }}px; height: {{ square.size }}px; background: {{ square.color }}; position: absolute; left: {{ square.xPosition }}px; top: {{ square.yPosition }}px;"><ng-chess-piece square="square"></div>',
    link: function (scope, element, attrs) {
      element.droppable({
        accept: function(draggable) {
          return true;
        },
        drop: function(event, ui) {
          piece_scope = angular.element(event.toElement || event.relatedTarget).scope()
          scope.square.chessGame.makeMoveFromIndices(piece_scope.square.index, scope.square.index);
          scope.$apply();
          piece_scope.$apply();
        }
      })
    }
  }
}).directive('ngChessPiece', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      square: "="
    },
    template: '<span style="font-size: {{ square.size.toString() }}px; position: relative; top: {{ -square.size * 1/4 }}px; cursor:pointer;" ng-hide="square.getPieceImage() == null" >{{ square.getPieceImage() }}</span>',
    link: function (scope, element, attrs) {
      scope.topOffset = function() {
        return -scope.square.size * 1/4;
      }
      element.draggable({zIndex: 999999})
      element.draggable({
        disable: false,
        revert: "invalid",
      }).draggable({
        start: function(event, ui) {
        },
        stop: function(event, ui) {
          element.css("top", scope.topOffset() + "px");
          element.css("left", "0px");
        },
        drag: function(event, ui) {
        },
        deactivate: function(event, ui) {
        }
      });
    }
  }
}).directive('ngMoveList', function() {
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
    template: tableTemplate,
    controller: moveListController
  }
});
