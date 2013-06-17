describe("NotationProcessor", function() {
  var notationProcessor;
  var chessBoard;

  function clearChessBoard() {
    _.each(_.range(64), function(index) {
      if(!(chessBoard.getPieceRaw(index) instanceof King))
        chessBoard.setPieceRaw(index);
    });
  }

  function expectIndexToBeRankFile(index, rankIndex, fileIndex) {
    expect(index).toBe(rawFromRankFile(rankIndex, fileIndex));
  }

  function setPieceOnBoard(algebraicName, pieceConstructor, color) {
    chessBoard.setPieceRaw(
      notationProcessor.squareNameToIndex(algebraicName),
      new pieceConstructor(color, chessBoard)
	)
  }
  
  function expectMove(algebraicMove) {
    var move = notationProcessor.parseAlgebraicMove(algebraicMove);
    args = Array.apply(undefined, arguments).splice(0, 1);
    var expectedMove = buildMove.apply(undefined, args);
    expect.toBeTruthy(move.equals(expectedMove));
  }

  beforeEach(function() {
    chessBoard = new ChessBoard();
    notationProcessor = new NotationProcessor(chessBoard);
    clearChessBoard();
  });

  it("Converts algebraic notation into indices.", function() {
    expectIndexToBeRankFile(
      notationProcessor.squareNameToIndex('e4'),
      3, 4);
    expectIndexToBeRankFile(
      notationProcessor.squareNameToIndex('a8'),
      7, 0);
    expectIndexToBeRankFile(
      notationProcessor.squareNameToIndex('a1'),
      0, 0);
    expectIndexToBeRankFile(
      notationProcessor.squareNameToIndex('h8'),
      7, 7);
  });
  
  
  it("Picks the right color pawn when both can move there.", function() {
    setPieceOnBoard('f7', Pawn, BLACK);
    setPieceOnBoard('e6', Pawn, WHITE);
    expectMove('exf7+', 5, 4, 6, 5);
    expectMove('exf7#', 5, 4, 6, 5);
    setPieceOnBoard('e2', Pawn, WHITE);
    expectMove('e4', 1, 4, 3, 4);
    setPieceOnBoard('e3', Pawn, WHITE);
    expectMove('e4', 2, 4, 3, 4);
    expectMove('exd4', 2, 4, 3, 3);
    setPieceOnBoard('e5', Pawn, BLACK);
    expectMove('e4', 4, 4, 3, 4);
    expectMove('exd4', 4, 4, 3, 3);
  });
});
