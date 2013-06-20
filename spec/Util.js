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
  this.chessBoard = new ChessBoard();
  this.notationProcessor = new NotationProcessor(this.chessBoard);
  this.setPiece = setPiece;
  this.clearChessBoard = clearChessBoard;

  var that = this;
  function toBeParsedAsRaw(sourceIndex, destinationIndex, promotion) {
    var move = that.notationProcessor.parseAlgebraicMove(this.actual);
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
    toBeParsedAsAlgebraic: function(source, destination, promotion) {
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
}
