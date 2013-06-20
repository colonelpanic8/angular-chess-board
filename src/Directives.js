pieceNameToImage = {
  k: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/wk.png",
  K: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/bk.png",
  p: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/wp.png",
  P: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/bp.png",
  r: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/wr.png",
  R: "http://images.chesscomfiles.com/js/chess/images/chess/pieces/modern2/45/br.png",
}

angular.module('chessBoard').directive('ngChessBoard', function () {
    function chessBoardController($scope, $attrs, ChessBoard) {
      chessBoard = new ChessBoard();
      var Square = function (index) {
        this.index = index;
      }
      Square.prototype.size = $attrs.squareSize
      Square.prototype.lightColor = $attrs.lightColor
      Square.prototype.darkColor = $attrs.darkColor
      Square.prototype.getRow = function () {
        return 7 - ((this.index - this.getColumn()) >> 3);
      };
      Square.prototype.getColumn = function () {
        return this.index & 7;
      };
      Square.prototype.getXPosition = function () {
        return this.getColumn() * this.size;
      }
      Square.prototype.getYPosition = function () {
        return this.getRow() * this.size;
      }
      Square.prototype.color = function () {
        return (this.getColumn() & 0x1) == (this.getRow() & 0x1) ? this.lightColor : this.darkColor;
      }
      Square.prototype.getPieceImage = function() {
        piece = chessBoard.getPiece(this.index);
        if (piece) {
          return pieceNameToImage[piece.getName()]
        }
        return null;
      }
      $scope.squares = []
      for (var i = 0; i < 64; i++) {
        $scope.squares.push(new Square(i));
      }
      chessBoard.listen(
       $scope.$apply
      )
    }
    return {
      restrict: 'E',
      replace: true,
      template: '<ng-chess-square square="square" ng-repeat="square in squares">',
      controller: chessBoardController
    }
  }).directive('ngChessSquare', function () {
    return {
      restrict: 'E',
      replace: true,
      OAscope: {
        square: "=square"
      },
      template: '<div style="width: {{ square.size }}px; height: {{ square.size }}px; background: {{ square.color() }}; position: absolute; left: {{ square.getXPosition() }}px; top: {{ square.getYPosition() }}px;"><ng-chess-piece square="square"></div>',
      link: function (scope, element, attrs) {
        element.droppable({
          accept: function(draggable) {
            return true;
          },
          drop: function(event, ui) {
            piece_scope = angular.element(event.toElement || event.relatedTarget).scope()
            chessBoard.makeMove(piece_scope.square.index, scope.square.index);
            scope.$apply();
            piece_scope.$apply();
          }
        })
      }
    }
  }).directive('ngChessPiece', function () {
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
  });
