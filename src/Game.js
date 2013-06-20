function ChessGame() {
  this.chessBoard = new ChessBoard();
  this.notationProcessor = new NotationProcessor(this.chessBoard);
}

ChessGame.prototype = {
  makeMoveFromAlgebraic: function(algebraicMove) {
    move = this.notationProcessor.parseAlgebraicMove(algebraicMove);
    this.chessBoard.makeLegalMove(move);
    return move;
  }
}
