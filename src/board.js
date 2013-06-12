var WHITE = 1;
var NONE = 0;
var BLACK = -1;

// Basic utility functions.
function isLegalSquare(squareIndex) {
  return squareIndex >= 0 && squareIndex < 64;
}

function isLegalSquareRowCol(rankIndex, fileIndex) {
  return rankIndex >= 0 && rankIndex < 8 && fileIndex >= 0 && fileIndex < 8;
}

function DirectionalIterator(rankIndex, fileIndex, rankDirection, fileDirection) {
  this.rankIndex = rankIndex;
  this.fileIndex = fileIndex;
  this.rankDirection = rankDirection;
  this.fileDirection = fileDirection;
}

DirectionalIterator.prototype.hasNext = function() {
  return isLegalSquareRowCol(this.rankIndex, this.fileIndex);
}

DirectionalIterator.prototype.next = function() {
  this.rankIndex += this.rankDirection;
  this.fileIndex += this.fileDirection;
  return [this.rankIndex, this.fileIndex];
}

function OneSquareIterator(rankIndex, fileIndex) {
  this.square = [rankIndex, fileIndex];
  this.notUsed = true;
}

OneSquareIterator.prototype.hasNext = function() {
  if !isLegalSquareRowCol(this.square[0], this.square[1]) return false;
  return this.notUsed;
}

OneSquareIterator.prototype.next = function() {
  if(!this.hasNext()) throw "No More Items";
  this.notUsed = false;
  return this.square;
}

// Legal Moves decorators.
function withRowsCols(callable) {
  return function(row, col) {
    if (this.isLegalSquareRowCol(row, col)) {
      return callable.bind(this)(row*8 + col);
    }
    throw "Illegal square provided.";
  }
}

function withRowsColsSrcDst(callable) {
  return function(srcRow, srcCol, dstRow, dstCol) {
    if (this.isLegalSquareRowCol(srcRow, srcCol) && this.isLegalSquareRowCol(dstRow, dstCol)) {
      return callable.bind(this)(srcRow*8 + srcCol, dstRow*8 + dstCol);
    }
    throw "Illegal square provided.";
  };
}
  
function withLegalCheck(callable) {
  return function(squareIndex) {
    if (this.isLegalSquare(squareIndex)) {
      return callable.bind(this)(squareIndex);
    }
    throw "Illegal square provided.";
  }
}

function withLegalCheckSrcDst(callable) {
  return function(srcIndex, dstIndex) {
    if (this.isLegalSquare(srcIndex) && this.isLegalSquare(dstIndex)) {
      return callable.bind(this)(srcIndex, dstIndex);
    }
    throw "Illegal square provided.";
  }
}

// Pieces
var Piece = {
  moveIterators: function(rankIndex, fileIndex) {
    return _.map(this.directions, function(direction) {
      return new OneSquareIterator(rankIndex + direction[0], fileIndex + direction[1]);
    });
  },
  findSpecialMoves: function(rankIndex, fileIndex, chessRules) {
    return [];
  },
  getName: function() {
    if(this.color == BLACK) {
      return this.pieceCharacter.toUpperCase()
    }
    return this.pieceCharacter;
  }
};

var SlidingPiece = Object.create(Piece);
SlidingPiece.moveIterators = function(rankIndex, fileIndex) {
  return _.map(this.directions, function(direction) {
    return new DirectionalIterator(rankIndex, fileIndex, direction[0], direction[1]);
  });
}

var EmptySquare = Object.create(Piece);
EmptySquare.color = NONE;

function buildPieceType(directions, prototype, pieceCharacter) {
  var PieceType = function(color) {
    this.color = color;
  };
  PieceType.prototype = Object.create(prototype);
  PieceType.prototype.pieceCharacter = pieceCharacter;
  return PieceType;
}

var diagonals = [[-1, 1], [1, -1], [1, 1], [-1, -1]];
var straights = [[1, 0], [-1, 0], [0, 1], [0, -1]];
var all = _.union[diagonals, straights];
var knightDeltas = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];


var Knight = buildPieceType(knightDeltas, Piece, 'n');
var Queen = buildPieceType(all, SlidingPiece, 'q');
var Rook = buildPieceType(straights, SlidingPiece, 'r');
var Bishop = buildPieceType(diagonals, SlidingPiece, 'b');

var King = buildPieceType(all, Piece, 'k');
King.prototype.findSpecialMoves = function (rankIndex, fileIndex, board) {
  var availableCastles = [];
  var backRank = this.color == WHITE ? 0 : 7;
  if (board.canCastleKingside(this.color) && _.all(
    _.map(_.range(5, 7), function(file) {
      return board.getPieceRowCol(backRank, file).color == NONE;
    })))
    availableCastles.push(backRank, 6);
  if (board.canCastleQueenside(this.color) && _.all(
    _.map(_.range(1, 4), function(file) {
      return board.getPieceRowCol(backRank, file).color == NONE;
    })))
    availableCastles.push(backRank, 2);
  return availableCastles;
}

var Pawn = buildPieceType([1, 0], Piece, 'p');
Pawn.prototype.moveIterators: function(rankIndex, fileIndex) {
  // This doesn't even work because it would allow you to take by
  // moving directly forward.
  // return [new OneSquareIterator(rankIndex + this.color, fileIndex)];
  return [];
};
Pawn.prototype.findSpecialMoves = function(rankIndex, fileIndex, board) {
  var newRankIndex = rankIndex + this.color;
  var foundMoves = [];
  // Check for legal takes.
  _.each([-1 + fileIndex, 1 + fileIndex], function(newFileIndex) {
    try {
      if(board.getPieceRowCol(newRankIndex, newFileIndex).color == this.color*(-1) || 
         this.isEnpassantAvailable(newRankIndex, newFileIndex, board))
        foundMoves.push([newRankIndex, newFileIndex]);
    } catch(err) {}
  });
  if(board.getPieceRowCol(newRankIndex, fileIndex).color == NONE)
    foundMoves.push([newRankIndex, fileIndex]);
  newRankIndex += 1;
  if(rankIndex == modulus(this.color, 8) && board.getPieceRowCol(newRankIndex, fileIndex).color == NONE)
    foundMoves.push([newRankIndex, fileIndex]);
  return foundMoves;
}
Pawn.prototype.enpassantSquares = {}
Pawn.prototype.enpassantSquares[WHITE] = 4;
Pawn.prototype.enpassantSquares[BLACK] = 3;
Pawn.prototype.isEnpassantAvailable(rankIndex, fileIndex, board) {
  if(this.rankIndex != this.enpassantSquares[this.color]) return False;
  var lastMove = _.last(board.moves);
  return lastMove.piece instanceof Pawn &&
     lastMove.sourceFile == fileIndex &&
     lastMove.sourceRank == rankIndex + this.color &&
     lastMove.destRank == rankIndex - this.color;
}

var pieces = {k: King, q: Queen, r: Rook, b: Bishop, n: Knight, p: Pawn}

function ChessBoard() {
  this.reset()
  this.listeners = []
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

ChessBoard.prototype.reset = function() {
  this.action = WHITE;
  this.whiteCanCastleKingside = true;
  this.blackCanCastleKingside = true;
  this.whiteCanCastleQueenside = true;
  this.blackCanCastleQueenside = true;
  this.board = _.union(
    this.majorPieceRowForColor(WHITE),
    _.map(_.range(8), function(index) {return new Pawn(WHITE)}),
    _.map(_.range(4*8), function(index) {return EmptySquare}),
    _.map(_.range(8), function(index) {return new Pawn(BLACK)}),
    this.majorPieceRowForColor(BLACK)
  );
  this.moves = []
}
ChessBoard.prototype.isLegalSquare = isLegalSquare;
ChessBoard.prototype.isLegalSquareRowCol = isLegalSquareRowCol;
ChessBoard.prototype.makeMoveNoChecks = function(sourceIndex, destIndex) {
  var takenPiece = this.board[destIndex];
  var takingPiece = this.board[sourceIndex];
  this.board[sourceIndex] = EmptySquare;
  this.board[destIndex] = taking_piece;
  return {
    sourceRank: (sourceIndex - sourceIndex % 8)/8,
    sourceFile: sourceIndex % 8,
    destRank: (destIndex - destIndex % 8)/8,
    destFile: destIndex % 8,
    takenPiece: takenPiece,
    takingPiece: takingPiece
  }
}

ChessBoard.prototype.threatenedMovesForPiece = function(rankIndex, fileIndex, piece) {
  var threatenedMoves = [];
  _.each(piece.moveIterators(rankIndex, fileIndex), function (moveIterator) {
    for(var square = moveIterator.next(); moveIterator.hasNext(); square = moveIterator.next()) {
      targetPiece = this.board.getPiece(square[0], square[1])
      switch(targetPiece.color) {
        case NONE:
        threatenedMoves.push(square);
        break;
        case piece.color:
        return;
        break;
        default:
        threatenedMoves.push(square);
        return;
      }
    }
  });
  return _.union(threatenedMoves, piece.findSpecialMoves(rankIndex, fileIndex, this));
}

ChessBoard.prototype.makeMoveRowsCols = withRowsColsSrcDst(
  ChessBoard.prototype.makeMoveNoChecks
);

ChessBoard.prototype.makeMove = withLegalCheckSrcDst(
  ChessBoard.prototype.makeMoveNoChecks
);

ChessBoard.prototype.getPieceNoChecks = function(squareIndex) {
  return this.board[squareIndex];
}

ChessBoard.prototype.getPieceRowCol = withRowsCols(
  ChessBoard.prototype.getPieceNoChecks
);

ChessBoard.prototype.getPiece = withLegalCheck(
  ChessBoard.prototype.getPieceNoChecks
);

ChessBoard.prototype.canCastleKingside = function(color) {
  return color == WHITE ? return this.whiteCanCastleKingside : this.blackCanCastleKingside;
}

ChessBoard.prototype.canCastleQueenside = function(color) {
  return color == WHITE ? return this.whiteCanCastleQueenside : this.blackCanCastleQueenside;
}

ChessBoard.prototype.listen = function(callable) {
  this.listeners.push(callable);
}

angular.module('chessBoard').factory('ChessBoard', function () {
  return ChessBoard
})
