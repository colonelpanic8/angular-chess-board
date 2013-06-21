describe("ChessBoard", function() {
  beforeEach(setupChessBoardAndMatchers);
  beforeEach(clearChessBoard);

  it("does not allow kings to make moves that leave them in check", function() {
    this.chessBoard.reset();
    // TODO: get rid of buildMove invocations here.
    this.chessBoard.makeLegalMove(buildMove(1, 4, 3, 4));
    this.chessBoard.makeLegalMove(buildMove(6, 3, 4, 3));
    this.chessBoard.makeLegalMove(buildMove(0, 4, 1, 4));
    this.chessBoard.makeLegalMove(buildMove(4, 3, 3, 4));
    this.chessBoard.makeLegalMove(buildMove(1, 4, 2, 4));
    this.chessBoard.makeLegalMove(buildMove(7, 3, 2, 3));
  });

  it("does not allow other pieces to make moves that leave their king in check", function() {
    this.setPiece('e2', Rook, WHITE);
    this.setPiece('e3', Rook, BLACK);
    expect(function() {
      this.chessBoard.makeLegalMove(
        this.notationProcessor.parseMoveFromSquareNames('e2', 'd2')
      );
    }.bind(this)).toThrow();
  });

  it("can undo a simple move", function() {
    this.setPiece('e2', Pawn, WHITE);
    var originalState = this.chessGame.gameState();
    this.chessGame.makeMoveFromAlgebraic('e4');
    this.chessGame.undoLastMove();
    expect(this.chessGame.gameState()).toBeThePosition(originalState);
  });

  it("can undo a taking move", function() {
    this.setPiece('e2', Pawn, WHITE);
    this.setPiece('d7', Pawn, BLACK);
    var originalState = this.chessGame.gameState();
    this.chessGame.makeMoveFromAlgebraic('e4');
    this.chessGame.makeMoveFromAlgebraic('d5');
    this.chessGame.makeMoveFromAlgebraic('exd5');
    this.chessGame.undoLastMove();
    this.chessGame.undoLastMove();
    this.chessGame.undoLastMove();
    expect(this.chessGame.gameState()).toBeThePosition(originalState);
  });
  
  it("can undo castling", function() {
    this.setPiece('h1', Rook, WHITE);
    this.setPiece('a8', Rook, BLACK);
    var originalState = this.chessGame.gameState();
    this.chessGame.makeMoveFromAlgebraic('O-O');
    this.chessGame.undoLastMove();
    expect(this.chessGame.gameState()).toBeThePosition(originalState);

    this.chessGame.makeMoveFromAlgebraic('O-O');
    this.chessGame.makeMoveFromAlgebraic('O-O-O');
    console.log(this.chessGame.boardString());
    
    this.chessGame.undoLastMove();
    this.chessGame.undoLastMove();
    expect(this.chessGame.gameState()).toBeThePosition(originalState);
  });

  it("can undo en passant", function() {
    this.setPiece('a7', Pawn, BLACK);
    this.setPiece('b4', Pawn, WHITE);
    this.chessGame.makeMoveFromAlgebraic('b5');
    this.chessGame.makeMoveFromAlgebraic('a5');
    var originalState = this.chessGame.gameState();
    this.chessGame.makeMoveFromAlgebraic('bxa6');
    this.chessGame.undoLastMove();
    expect(this.chessGame.gameState()).toBeThePosition(originalState);
  });

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
