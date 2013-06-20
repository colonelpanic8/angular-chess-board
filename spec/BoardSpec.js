describe("ChessBoard", function() {
  beforeEach(setupChessBoardAndMatchers);

  it("does not allow placing the king in check", function() {
    this.chessBoard.makeLegalMove(buildMove(1, 4, 3, 4));
    this.chessBoard.makeLegalMove(buildMove(6, 3, 4, 3));
    this.chessBoard.makeLegalMove(buildMove(0, 4, 1, 4));
    this.chessBoard.makeLegalMove(buildMove(4, 3, 3, 4));
    this.chessBoard.makeLegalMove(buildMove(1, 4, 2, 4));
    this.chessBoard.makeLegalMove(buildMove(7, 3, 2, 3));
  });

  describe("Empty ChessBoard", function() {
    beforeEach(clearChessBoard);

    it("finds kings", function() {
      expect(King.find(this.chessBoard, squareNameToIndex('e2'))).toBeAlgebraic('e1');
      expect(King.find(this.chessBoard, squareNameToIndex('d1'))).toBeAlgebraic('e1');
      
      this.chessBoard.startingAction = BLACK;
      expect(King.find(this.chessBoard, squareNameToIndex('d7'))).toBeAlgebraic('e8');
    });

    it("finds knights", function() {      
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

    it("finds pieces with disambiguation by blockages", function() {
      this.setPiece('c4', Rook, WHITE); // The piece we want to find.

      // Below
      this.setPiece('e3', Knight, BLACK);
      this.setPiece('e2', Rook, WHITE); 

      // Right
      this.setPiece('f4', Pawn, BLACK);
      this.setPiece('g4', Rook, WHITE);

      // Top
      this.setPiece('e5', Pawn, BLACK);
      this.setPiece('e6', Rook, WHITE);
      this.setPiece('e7', Pawn, BLACK);

      expect(Rook.find(this.chessBoard, squareNameToIndex('e4'))).toBeAlgebraic('c4');
    });

    it("moves the rook when castling", function() {
      this.setPiece('h1', Rook, WHITE);
      console.log(this.chessBoard.boardString());
      this.chessBoard.makeLegalMove(this.notationProcessor.parseAlgebraicMove('O-O'));
      console.log(this.chessBoard.boardString());
      expect(this.chessBoard.getPiece(0, 5).getName()).toBe('r');
    });
  });

});
