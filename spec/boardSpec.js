describe("ChessBoard", function() {
  beforeEach(setupChessBoardAndMatchers);

  it("should not allow placing the king in check", function() {
    this.chessBoard.makeLegalMove(buildMove(1, 4, 3, 4));
    this.chessBoard.makeLegalMove(buildMove(6, 3, 4, 3));
    this.chessBoard.makeLegalMove(buildMove(0, 4, 1, 4));
    this.chessBoard.makeLegalMove(buildMove(4, 3, 3, 4));
    this.chessBoard.makeLegalMove(buildMove(1, 4, 2, 4));
    this.chessBoard.makeLegalMove(buildMove(7, 3, 2, 3));
  });

  describe("Empty ChessBoard", function() {
    beforeEach(clearChessBoard);

    it("Finds kings", function() {
      expect(King.find(this.chessBoard, squareNameToIndex('e2'))).toBeAlgebraic('e1');
      expect(King.find(this.chessBoard, squareNameToIndex('d1'))).toBeAlgebraic('e1');
      
      this.chessBoard.startingAction = BLACK;
      expect(King.find(this.chessBoard, squareNameToIndex('d7'))).toBeAlgebraic('e8');
    });

    it("Finds knights", function() {      
      this.setPiece('b1', Knight, WHITE);
      expect(Knight.find(this.chessBoard, squareNameToIndex('c3'))).toBeAlgebraic('b1');

      // Check that we can disambiguate by file.
      this.setPiece('d5', Knight, WHITE);
      expect(
      	Knight.find(this.chessBoard, squareNameToIndex('c3'), null, fileToIndex('d'))
      ).toBeAlgebraic('d5');

      // Check that we can disambiguate by rank.
      this.setPiece('b1');
      this.setPiece('d1', Knight, WHITE);
      expect(
      	Knight.find(this.chessBoard, squareNameToIndex('c3'), 0)
      ).toBeAlgebraic('d1');
      
      // Check that we don't need disambiguation when there is a black
      // piece there.
      this.setPiece('d5', Knight, BLACK);
      expect(
      	Knight.find(this.chessBoard, squareNameToIndex('c3'), null, fileToIndex('d'))
      ).toBeAlgebraic('d1');

      // We shouldn't find anything because the only piece that can
      // move there is black.
      this.setPiece('d1');
      expect(
      	Knight.find(this.chessBoard, squareNameToIndex('c3'), null, fileToIndex('d'))
      ).toBeFalsy();

      // ... unless we explicitly specify a color.
      expect(
      	Knight.find(this.chessBoard, squareNameToIndex('c3'), null, fileToIndex('d'), BLACK)
      ).toBeAlgebraic('d5');
    });

    it("Finds Bishops", function() {
    });
  });

});
