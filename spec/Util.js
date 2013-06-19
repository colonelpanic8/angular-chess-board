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
}
