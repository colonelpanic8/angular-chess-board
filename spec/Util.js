function clearChessBoard() {
  _.each(_.range(64), function(index) {
    if(!(this.chessBoard.getPieceRaw(index) instanceof King))
      this.chessBoard.setPieceRaw(index);
  }, this);
}

function setPiece(algebraicName, pieceConstructor, color) {
  this.chessBoard.setPieceRaw(
    squareNameToIndex(algebraicName),
    pieceConstructor ? new pieceConstructor(color, this.chessBoard) : EmptySquare
  )
}

function getPiece(algebraicName) {
  return this.chessBoard.getPieceRaw(squareNameToIndex(algebraicName));
}

function checkMove(algebraicMove, algebraicSource, algebraicDest) {
  var move = this.notationProcessor.parseAlgebraicMove(algebraicMove);
  expect(move.algebraicSource).toBe(algebraicSource);
  expect(move.algebraicDest).toBe(algebraicDest);
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

function assertMovesListEqual(rawMovesList, rankFileMovesList) {
  var left = rawMovesList.sort()
  var right = _.map(rankFileMovesList, function(rankFile) {
    return rankFileToRaw(rankFile[0], rankFile[1]);
  }).sort()
  _.each(_.zip(left, right), function(squareIndices) {
    expect(squareIndices[0]).toBe(squareIndices[1]);
  });
}

function setupChessBoardAndMatchers() {
  this.chessGame = new ChessGame();
  this.chessBoard = this.chessGame.chessBoard;
  this.notationProcessor = this.chessGame.notationProcessor;
  this.setPiece = setPiece;
  this.getPiece = getPiece;
  this.testGame = function(moves) {
    var returnedMoves = _.map(moves, function(move) {
      return this.chessGame.makeMoveFromAlgebraic(move);
    }, this);
    var algebraics = _.map(returnedMoves, function(move) {
      if (move)
        return move.algebraic;
    });
    expect(algebraics).toBeArray(moves);
  };
  this.checkMove = checkMove;
  this.clearChessBoard = clearChessBoard;

  var that = this;
  function toBeParsedAsRaw(sourceIndex, destinationIndex, promotion) {
    var move = that.notationProcessor.parseAlgebraicMove(this.actual);
    var expectedMove = new Move(sourceIndex, destinationIndex, that.chessBoard, promotion);
    this.message = function() {
      return "Expected " +  this.actual + " to be parsed as " + expectedMove.algebraic +
        ", but actual move was " + move.algebraic;
    }
    if(!move) return false;
    return expectedMove.equals(move);
  }

  
  this.addMatchers({
    toBeArray: function(other) {
      var firstNotMatching = _.find(_.zip(this.actual, other), function(values) {
        return values[0] != values[1];
      });
      this.message = function() {
        return "Expected " + firstNotMatching[0] + " to be " + firstNotMatching[1];
      }
      return firstNotMatching === undefined;
    }
  });
  // Notation Matchers.
  this.addMatchers({
    toBeParsedAs: function(srcRank, srcFile, dstRank, dstFile, promotion) {
      return toBeParsedAsRaw.bind(this)(
        rawFromRankFile(srcRank, srcFile),
        rawFromRankFile(dstRank, dstFile),
        promotion
      );
    },
    toBeParsedAsAlgebraic: function(source, destination, promotion) {
      return toBeParsedAsRaw.bind(this)(
        squareNameToIndex(source),
        squareNameToIndex(destination),
        promotion
      );
    },
    toBeInstanceOf: function(pieceType, color) {
      return this.actual instanceof pieceType && this.actual.color == color;
    },
    toBeEmpty: function() {
      return this.actual == EmptySquare;
    },
  });

  // Comparison matchers.
  this.addMatchers({
    toBeRankFile: function(rankIndex, fileIndex) {
      return this.actual == rawFromRankFile(rankIndex, fileIndex);
    },
    toBeAlgebraic: function(algebraicMove) {
      this.message = function() {
        return "Expected (" + this.actual.toString() + ", " + indexToSquareName(this.actual) +
          ") to be (" + squareNameToIndex(algebraicMove) + ", " + algebraicMove + ")";
      }
      return this.actual == squareNameToIndex(algebraicMove);
    },
    toBeAlgebraics: function(algebraicMoves) {
      var expected = _.sortBy(_.map(algebraicMoves, function(algebraicMove) {
        return squareNameToIndex(algebraicMove);
      }), function(a) { return a });
      var actual = _.sortBy(this.actual, function(a) {return a});
      return _.all(_.zip(expected, actual), function(pair) { return pair[0] == pair[1] });
    }
  });

  this.addMatchers({
    toBeThePosition: function(position) {
      this.message = function() {
        var chessBoard = new ChessBoard();
        chessBoard.board = this.actual;
        var leftBoardString = chessBoard.boardString();
        chessBoard.board = position;
        var rightBoardString = chessBoard.boardString();
        return "Expected\n" + leftBoardString + "\nto be\n" + rightBoardString;
      }
      return _.all(_.zip(this.actual, position), function(pieces) {
        return pieces[0] === pieces[1];
      });
    }
  });
}
