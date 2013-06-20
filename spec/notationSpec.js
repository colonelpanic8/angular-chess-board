describe("NotationProcessor", function() {
  beforeEach(setupChessBoardAndMatchers);
  beforeEach(clearChessBoard);

  it("converts algebraic notation into indices", function() {
    expect(squareNameToIndex('e4')).toBeRankFile(3, 4);
    expect(squareNameToIndex('a8')).toBeRankFile(7, 0);
    expect(squareNameToIndex('a1')).toBeRankFile(0, 0);
    expect(squareNameToIndex('h8')).toBeRankFile(7, 7);
  });
  
  
  it("handles basic pawn moves", function() {
    this.setPiece('f7', Pawn, BLACK);
    this.setPiece('e6', Pawn, WHITE);
    expect('exf7+').toBeParsedAs(5, 4, 6, 5);
    expect('exf7#').toBeParsedAs(5, 4, 6, 5);
  });

  it("handles initial double pawn move", function() {
    this.setPiece('e2', Pawn, WHITE);
    expect('e4').toBeParsedAs(1, 4, 3, 4);

    this.setPiece('e3', Pawn, WHITE);
    expect('e4').toBeParsedAs(2, 4, 3, 4);
    this.setPiece('d4', Pawn, BLACK);
    expect('exd4').toBeParsedAs(2, 4, 3, 3);
  });

  it("chooses the appropriate piece given the current action", function() {
    this.setPiece('e3', Pawn, WHITE);
    this.setPiece('d4', Pawn, BLACK);
    expect('e4').toBeParsedAs(2, 4, 3, 4);
    
    expect('exd4').toBeParsedAs(2, 4, 3, 3);

    // Check that the selected pawn is affected by the current action.
    this.chessBoard.startingAction = BLACK;
    this.setPiece('e5', Pawn, BLACK);
    expect('e4').toBeParsedAs(4, 4, 3, 4);
    
    this.setPiece('d4', Pawn, WHITE);
    expect('exd4').toBeParsedAs(4, 4, 3, 3);
  });

  it("supports castling", function() {
    expect('O-O').toBeParsedAs(0, 4, 0, 6);
    expect('O-O-O').toBeParsedAs(0, 4, 0, 2);
    
    this.chessBoard.startingAction = BLACK;
    expect('O-O').toBeParsedAs(7, 4, 7, 6);
    expect('O-O-O').toBeParsedAs(7, 4, 7, 2);
  });

  it("handles promotion", function() {
    this.setPiece('a7', Pawn, WHITE);
    expect('a8=Q+').toBeParsedAs(6, 0, 7, 0, Queen);

    this.chessBoard.startingAction = BLACK;
    this.setPiece('a2', Pawn, BLACK);
    expect('a1=R').toBeParsedAs(1, 0, 0, 0, Rook);
  });

  it("handles moves with both rank and file disambiguation", function() {
    this.setPiece('Qa4', Queen, WHITE);
    expect('Qa4xa5').toBeParsedAs(3, 0, 4, 0);
  });

  it("handles bishop moves", function() {
    this.setPiece('a6', Bishop, WHITE);
    expect('Bb5').toBeParsedAs(5, 0, 4, 1);
    
    this.setPiece('a6');
    
    this.setPiece('e2', Bishop, WHITE);
    expect('Bb5').toBeParsedAs(1, 4, 4, 1);

    // Test disambiguations.
    this.setPiece('a6', Bishop, WHITE);
    expect('Beb5').toBeParsedAs(1, 4, 4, 1)
    expect('Bab5').toBeParsedAs(5, 0, 4, 1)
    
    this.setPiece('a4', Bishop, WHITE);
    expect('Ba4b5').toBeParsedAs(3, 0, 4, 1)
  });

  it("handles knight moves", function() {
    this.setPiece('e2', Knight, WHITE);
    expect('Ng3').toBeParsedAs(1, 4, 2, 6);
    expect('Nf4').toBeParsedAs(1, 4, 3, 5);
    
    this.setPiece('e4', Knight, WHITE);
    expect('N2g3').toBeParsedAs(1, 4, 2, 6);
    expect('N4g3').toBeParsedAs(3, 4, 2, 6);
    expect('Nf4').toBeParsedAs(1, 4, 3, 5);
    
    this.setPiece('g2', Knight, WHITE);
    expect('Ngf4').toBeParsedAs(1, 6, 3, 5);
    this.setPiece('g2', Knight, BLACK);
    expect('Nf4').toBeParsedAs(1, 4, 3, 5);
    this.chessBoard.startingAction = BLACK
    expect('Nf4').toBeParsedAs(1, 6, 3, 5);
  });

  it("handles rook moves", function() {
    this.chessBoard.startingAction = BLACK

    this.setPiece('a4', Rook, BLACK);
    expect('Re4').toBeParsedAs(3, 0, 3, 4);

    this.setPiece('h4', Rook, BLACK);
    expect('Rae4').toBeParsedAs(3, 0, 3, 4);
    expect('Rhe4').toBeParsedAs(3, 7, 3, 4);
  });

  it("handles queen moves", function() {
    this.setPiece('b4', Queen, WHITE);
    expect('Qe4').toBeParsedAs(3, 1, 3, 4);

    this.setPiece('b1', Queen, WHITE);
    expect('Qc2').toBeParsedAs(0, 1, 1, 2);
    expect('Q1xe4+').toBeParsedAs(0, 1, 3, 4);
  });

  it("handles king moves", function() {
    this.chessBoard.startingAction = WHITE
    expect('Ke2').toBeParsedAs(0, 4, 1, 4);
  
    this.chessBoard.startingAction = BLACK
    expect('Ke7').toBeParsedAs(7, 4, 6, 4);
  });
  
  it("returns a move when the source squareIndex is not truthy", function() {
    this.setPiece('a1', Rook, WHITE);
    expect('Ra4').toBeParsedAsAlgebraic('a1', 'a4');
  });

  it("builds sliding piece disambiguations", function() {
    this.chessBoard.startingAction = BLACK;
    this.setPiece('a1', Queen, BLACK);
    this.setPiece('b1', Queen, BLACK);
    expect(this.getPiece('a1').buildDisambiguation(
      this.chessBoard,
      this.notationProcessor.parseAlgebraicMove('Qaa2'))).toBe('a');

    this.setPiece('a3', Queen, BLACK);
    expect(this.getPiece('a1').buildDisambiguation(
      this.chessBoard,
      this.notationProcessor.parseAlgebraicMove('Qa1a2'))).toBe('a1');

    this.setPiece('b1');

    expect(this.getPiece('a1').buildDisambiguation(
      this.chessBoard,
      this.notationProcessor.parseAlgebraicMove('Q1a2'))).toBe('1');
  });
});
