describe("NotationProcessor", function() {
  var notationProcessor;
  var chessBoard;

  function clearChessBoard() {
    _.each(_.range(64), function(index) {
      if(!(chessBoard.getPieceRaw(index) instanceof King))
        chessBoard.setPieceRaw(index);
    });
  }

  function setPiece(algebraicName, pieceConstructor, color) {
    chessBoard.setPieceRaw(
      squareNameToIndex(algebraicName),
      pieceConstructor ? new pieceConstructor(color, chessBoard) : EmptySquare
	)
  }

  function formatMove(move) {
    if(!move) return "null";
    var baseString =  "(" + move.sourceRank.toString() + ", " + move.sourceFile.toString() + 
        "), (" + move.destRank.toString() + ", " + move.destFile.toString() + ")";
    if(move.promotion) {
      return baseString + " with promotion " + move.promotion.prototype.getName();  
    }
    return baseString;
  }

  beforeEach(function() {
    chessBoard = new ChessBoard();
    notationProcessor = new NotationProcessor(chessBoard);
    clearChessBoard();
    function toBeParsedAsRaw(sourceIndex, destinationIndex, promotion) {
      var move = notationProcessor.parseAlgebraicMove(this.actual);
      var expectedMove = new Move(sourceIndex, destinationIndex, promotion);
      this.message = function() {
        return "Expected " +  this.actual + " to be parsed as " + formatMove(expectedMove) +
          ", but actual move was " + formatMove(move);
      }
      if(!move) return false;
      return expectedMove.equals(move);
    }
    this.addMatchers({
      toBeParsedAs: function(srcRank, srcFile, dstRank, dstFile, promotion) {
        return toBeParsedAsRaw.bind(this)(
          rawFromRankFile(srcRank, srcFile),
          rawFromRankFile(dstRank, dstFile),
          promotion
        );
      },
      toBeParsedAsAlg: function(source, destination, promotion) {
        return toBeParsedAsRaw.bind(this)(
          squareNameToIndex(source),
          squareNameToIndex(destination),
          promotion
        );
      },
      toBeRankFile: function(rankIndex, fileIndex) {
        return this.actual == rawFromRankFile(rankIndex, fileIndex);
      }
    });
  });

  it("Converts algebraic notation into indices", function() {
    expect(squareNameToIndex('e4')).toBeRankFile(3, 4);
    expect(squareNameToIndex('a8')).toBeRankFile(7, 0);
    expect(squareNameToIndex('a1')).toBeRankFile(0, 0);
    expect(squareNameToIndex('h8')).toBeRankFile(7, 7);
  });
  
  
  it("Handles basic pawn moves", function() {
    setPiece('f7', Pawn, BLACK);
    setPiece('e6', Pawn, WHITE);
    expect('exf7+').toBeParsedAs(5, 4, 6, 5);
    expect('exf7#').toBeParsedAs(5, 4, 6, 5);
  });

  it("Handles initial double pawn move", function() {
    setPiece('e2', Pawn, WHITE);
    expect('e4').toBeParsedAs(1, 4, 3, 4);

    setPiece('e3', Pawn, WHITE);
    expect('e4').toBeParsedAs(2, 4, 3, 4);
    expect('exd4').toBeParsedAs(2, 4, 3, 3);
  });

  it("Chooses the appropriate piece given the current action", function() {
    setPiece('e3', Pawn, WHITE);
    expect('e4').toBeParsedAs(2, 4, 3, 4);
    expect('exd4').toBeParsedAs(2, 4, 3, 3);

    // Check that the selected pawn is affected by the current action.
    chessBoard.startingAction = BLACK;
    setPiece('e5', Pawn, BLACK);
    expect('e4').toBeParsedAs(4, 4, 3, 4);
    expect('exd4').toBeParsedAs(4, 4, 3, 3);
  });

  it("Supports castling", function() {
    expect('O-O').toBeParsedAs(0, 4, 0, 6);
	expect('O-O-O').toBeParsedAs(0, 4, 0, 2)
    
    notationProcessor.board.startingAction = BLACK;
	expect('O-O').toBeParsedAs(7, 4, 7, 6)
	expect('O-O-O').toBeParsedAs(7, 4, 7, 2)
  });

  it("Handles promotion", function() {
    setPiece('a7', Pawn, WHITE);
    expect('a8=Q+').toBeParsedAs(6, 0, 7, 0, Queen);

    notationProcessor.board.startingAction = BLACK;
    setPiece('a2', Pawn, BLACK);
    expect('a1=R').toBeParsedAs(1, 0, 0, 0, Rook);
  });

  it("Handles moves with both rank and file disambiguation", function() {
    expect('Qa4xa5').toBeParsedAs(3, 0, 4, 0);
  });

  it("Handles bishop moves", function() {
    setPiece('a6', Bishop, WHITE);
    expect('Bb5').toBeParsedAs(0, 5, 4, 1);
    
    setPiece('a6');
    
     
    // self.chess_board[0][5] = None
    // self.chess_board[1][4] = 'b'
    // expect('Bb5').toBeParsedAs(1, 4, 4, 1)

    // self.chess_board[5][0] = 'b'
    // expect('Beb5').toBeParsedAs(1, 4, 4, 1)
    // expect('Bab5').toBeParsedAs(5, 0, 4, 1)
    
    // self.chess_board[3][0] = 'b'
    // expect('Ba4b5').toBeParsedAs(3, 0, 4, 1)
  });

  it("Handles knight moves", function() {
    setPiece('e2', Knight, WHITE);
    expect('Ng3').toBeParsedAs(1, 4, 2, 6);
    expect('Nf4').toBeParsedAs(1, 4, 3, 5);
    
    setPiece('e4', Knight, WHITE);
    expect('N2g3').toBeParsedAs(1, 4, 2, 6);
    expect('N4g3').toBeParsedAs(3, 4, 2, 6);
    expect('Nf4').toBeParsedAs(1, 4, 3, 5);
    
    setPiece('g2', Knight, WHITE);
    expect('Ngf4').toBeParsedAs(1, 6, 3, 5);
    setPiece('g2', Knight, BLACK);
    expect('Nf4').toBeParsedAs(1, 4, 3, 5);
    chessBoard.startingAction = BLACK
    expect('Nf4').toBeParsedAs(1, 6, 3, 5);
  });

  it("Handles rook moves", function() {
    chessBoard.startingAction = BLACK

    setPiece('a4', Rook, BLACK);
    expect('Re4').toBeParsedAs(3, 0, 3, 4);

    setPiece('h4', Rook, BLACK);
    expect('Rae4').toBeParsedAs(3, 0, 3, 4);
    expect('Rhe4').toBeParsedAs(3, 7, 3, 4);
  });

  it("Handles queen moves", function() {
    setPiece('b4', Queen, WHITE);
    expect('Qe4').toBeParsedAs(3, 1, 3, 4);

    setPiece('b1', Queen, WHITE);
    expect('Qc2').toBeParsedAs(0, 1, 1, 2);
    expect('Q1xe4+').toBeParsedAs(0, 1, 3, 4);
  });

  it("Handles king moves", function() {
    chessBoard.startingAction = WHITE
    expect('Ke2').toBeParsedAs(0, 4, 1, 4);
  
    chessBoard.startingAction = BLACK
    expect('Ke7').toBeParsedAs(7, 4, 6, 4);
  });
});
