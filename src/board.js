var WHITE = 1
var NONE = 0
var BLACK = -1

function King(color) {
  this.color = color;
}
function Queen(color) {
  this.color = color;
}
function Rook(color) {
  this.color = color;
}
function Bishop(color) {
  this.color = color;
}
function Knight(color) {
  this.color = color;
}
function Pawn(color) {
  this.color = color;
}

var pieces = {
  k: King,
  q: Queen,
  r: Rook,
  b: Bishop,
  n: Knight,
  p: Pawn
}

for (pieceLetter in pieces) {
  function getName() {
    if(this.color == BLACK) {
      return this.letter.toUpperCase()
    }
    return this.letter
  }
  pieces[pieceLetter].prototype.getName = getName
  pieces[pieceLetter].prototype.letter = pieceLetter
}

function ChessBoard() {
  this.reset()
  this.listeners = []
}

ChessBoard.prototype.reset = function() {
  this.board = []
  this.moves = []
  this.board.push.apply(this.board, this.majorPieceRowForColor(WHITE));
  for (var i = 0; i < 8; i++) {
    this.board.push(new Pawn(WHITE))
  }
  for (var i = 0; i < 32; i++) {
    this.board.push(null);
  }
  for (var i = 0; i < 8; i++) {
    this.board.push(new Pawn(BLACK))
  }
  this.board.push.apply(this.board, this.majorPieceRowForColor(BLACK));
}

ChessBoard.prototype.majorPieceRowForColor = function(color) {
  return [
  	new Rook(color),
  	new Knight(color),
  	new Bishop(color),
  	new Queen(color),
  	new King(color),
  	new Bishop(color),
    new Knight(color),
    new Rook(color)
  ];
}

ChessBoard.prototype.isLegalSquare = function(squareIndex) {
  return squareIndex >= 0 && squareIndex < 64;
}

ChessBoard.prototype.isLegalSquareRowCol = function(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

ChessBoard.prototype.makeMoveRowsCols = function(srcRow, srcCol, dstRow, dstCol) {
  if (this.isLegalSquareRowCol(srcRow, srcCol) && this.isLegalSquareRowCol(dstRow, dstCol)) {
    return this.makeMove(srcRow*8 + srcCol, dstRow*8 + dstCol);
  }
}

ChessBoard.prototype.makeMove = function(src, dst) {
  if (this.isLegalSquare(src) && this.isLegalSquare(dst)) {
    if (this.isLegalMove(src, dst)) {
      var taken_piece = this.board[dst];
      var taking_piece = this.board[src];
      this.board[src] = null;
      this.board[dst] = taking_piece;
      var moveEvent = {
        src: src,
        dst: dst,
        taken_piece: taken_piece
      }
      this.moves.push(moveEvent);
      for (var i = 0; i < this.listeners.length; i++) {
        this.listeners[i](moveEvent);
      }
    }
  }
}

ChessBoard.prototype.isLegalMove = function(src, dst) {
  return true;
}

ChessBoard.prototype.getPieceRowCol = function(row, col) {
  if (this.isLegalSquareRowCol(row, col)) {
    return this.getPiece(squareIndex);
  }
}

ChessBoard.prototype.getPiece = function(squareIndex) {
  if (this.isLegalSquare(squareIndex)) {
    return this.board[squareIndex];
  }
}

ChessBoard.prototype.listen = function(callable) {
  this.listeners.push(callable);
}

angular.module('chessBoard').factory('ChessBoard', function () {
  return ChessBoard
})
