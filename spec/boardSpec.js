describe("ChessBoard", function() {
  var chessBoard;
  beforeEach(function() {
    cb = new ChessBoard();
  });

  it("should prevent castle through check", function() {
    cb.makeLegalMove(buildMove(1, 4, 3, 4));
    cb.makeLegalMove(buildMove(6, 3, 4, 3));
    cb.makeLegalMove(buildMove(0, 4, 1, 4))
    cb.makeLegalMove(buildMove(4, 3, 3, 4))
    cb.makeLegalMove(buildMove(1, 4, 2, 4))
    cb.makeLegalMove(buildMove(7, 3, 2, 3))
    cb.getLegalMoves(2, 4);
    debugger;
  });
  
});
