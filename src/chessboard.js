var chessBoard = angular.module('chessBoard', [])
    .directive('ngChessBoard', function () {
        
        function chessBoardController($scope, $attrs) {
            var Square = function (index, contents) {
                this.index = index;
                this.contents = contents
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
            $scope.squares = []
            for (var i = 0; i < 64; i++) {
                $scope.squares.push(new Square(i, null));
            }
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
            scope: {
                square: "=square"
            },
            template: '<div><img style="width: {{ square.size }}px; height: {{ square.size }}px; background: {{ square.color() }}; position: absolute; left: {{ square.getXPosition() }}px; top: {{ square.getYPosition() }}px;"></div>'
        }
    }).directive('ngChessPiece', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                peice: "=peice"
            },
            template: '<span>tt</span>'
        }
    });
