function ChessGame() {
  this.chessBoard = new ChessBoard();
  this.notationProcessor = new NotationProcessor(this.chessBoard);
  this.listeners = [];
}

ChessGame.prototype = {
  makeMoveFromAlgebraic: function(algebraicMove) {
    return this.tryToMakeMove(
      this.notationProcessor.parseAlgebraicMove(algebraicMove)
    );
  },
  makeMoveFromIndices: function(sourceIndex, destIndex, promotion) {
    return this.tryToMakeMove(
      new Move(sourceIndex, destIndex, this.chessBoard, promotion)
    );
  },
  tryToMakeMove: function(move) {
    try {
      this.chessBoard.makeLegalMove(move);
    } catch(err) {
      return null;
    }
    return move;
  },
  getPiece: function(squareIndex) { return this.chessBoard.getPieceRaw(squareIndex); },
  listen: function(callable) {
    this.listeners.push(callable);
  }
}

ChessGame.prototype.makeMoveFromRankFile = rawToRankFileSrcDst(
  ChessGame.prototype.makeMoveFromIndices
);

angular.module('chessBoard').factory('ChessGame', function() { return ChessGame; });
