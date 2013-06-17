function squareNameToIndex(squareName) {
  return rawFromRankFile(rankToIndex(squareName[0]), fileToIndex(squareName[1]));
}

function fileToIndex(fileChar) {
  return fileChar.charCodeAt(0) - 97;
}

function rankToIndex(rankChar) {
  return parseInt(rankChar) - 1;
}

function NotationProcessor(chessBoard) {
  this.board = chessBoard;
}

NotationProcessor.prototype = {
  parseUCIMove: function(move) {
    var promotion = null;
    if(move.length > 4) {
      move = move.slice(0, 4);
      promotion = move[4];
    }
    return this.buildMoveFromSquareNames(
      move.slice(0, 2),
      move.slice(2, 2),
      promotion
    );
  },
  parseAlgebraicMove: function(algebraicMove) {
    
  },
  buildMoveFromSquareNames: function(source, dest, promotion) {
    
  }
}
