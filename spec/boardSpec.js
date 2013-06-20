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
      this.chessBoard.makeLegalMove(this.notationProcessor.parseAlgebraicMove('O-O'));
      expect(this.chessBoard.getPiece(0, 5).getName()).toBe('r');
    });

    it("finds multiple sliding pieces", function() {
      this.setPiece('c1', Rook, WHITE);
      this.setPiece('a4', Rook, WHITE);

      expect(Rook.find(this.chessBoard, squareNameToIndex('a1'), null, null, null, true))
        .toBeAlgebraics(['c1', 'a4']);
    });

    it("finds multiple pieces", function() {
      this.setPiece('c3', Knight, WHITE);
      this.setPiece('c5', Knight, WHITE);
      this.setPiece('b2', Knight, WHITE);
      
     expect(Knight.find(this.chessBoard, squareNameToIndex('a4'), null, null, null, true))
        .toBeAlgebraics(['c3', 'c5', 'b2']); 
    });

    it("finds queens in many directions", function() {
      this.setPiece('a1', Queen, WHITE);
      this.setPiece('d4', Queen, WHITE);
      this.setPiece('c4', Queen, WHITE);
      this.setPiece('a3', Queen, WHITE);

      expect(Queen.findAll(this.chessBoard, squareNameToIndex('c3'))).
        toBeAlgebraics(['a1', 'd4', 'c4', 'a3']);
    });
  });

});
