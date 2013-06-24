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
  k: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/wk.png",
  K: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/bk.png",
  q: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/wq.png",
  Q: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/bq.png",
  r: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/wr.png",
  R: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/br.png",
  n: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/wn.png",
  N: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/bn.png",
  b: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/wb.png",
  B: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/bb.png",
  p: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/wp.png",
  P: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/bp.png",
}

var tableTemplate = '<table><th class="movePair">#</th>';
tableTemplate += '<th class="movePair">White</th><th class="movePair">Black</th>'
tableTemplate += '<tr class="movePair" ng-repeat="movePair in movePairs">'
tableTemplate += '<td>{{ $index + 1 }}</td>';
tableTemplate += '<td><a ng-click="rewindTo(movePair[0])">{{ movePair[0].algebraic }}</a></td>'
tableTemplate += '<td><a ng-click="rewindTo(movePair[1])">{{ movePair[1].algebraic }}</a></td>'
tableTemplate += '</tr></table>'

angular.module('ChessGame').directive('ngChessBoard', function () {
  function chessBoardController($scope, $attrs) {
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
    $scope.__defineGetter__('segmentedSquares', function() {
      return _.map(_.range(0, 64, 8), function(index) {
        return $scope.squares.slice(64 - (index + 8), 64 - index);
      });
    });
  }
  return {
    restrict: 'E',
    replace: true,
    template: '<table class="chess-board" style="position: relative">' +
      '<tr ng-repeat="squareRow in segmentedSquares">' +
      '<td><ng-chess-square square="square" ng-repeat="square in squareRow" ></td>' +
      '</tr>' + '</table>',
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
      square: "=square"
    },
    template: '<img src="{{ square.getPieceImage() }}" style="width: 100%;" ng-hide="square.getPieceImage() == null" >',
    link: function (scope, element, attrs) {
      element.draggable({zIndex: 999999})
      element.draggable({
        disable: false,
        revert: "invalid",
      }).draggable({
        start: function(event, ui) {
        },
        stop: function(event, ui) {
          element.css("top", "0px");
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
      this.chessGame.undoToMove(move);
    }
    $scope.updateMovePairs = function() {
      $scope.movePairs = segment($scope.chessGame.chessBoard.moves, 2);
    }
    $scope.chessGame.addListener($scope.updateMovePairs);
  }
  return {
    restrict: 'E',
    replace: true,
    template: tableTemplate,
    controller: moveListController
  }
});
