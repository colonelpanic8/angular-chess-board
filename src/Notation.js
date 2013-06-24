String.prototype.isLower = function() {
  return _.all(this, function(character) {
    var charCode = character.charCodeAt(0);
    return  charCode >= 97 && charCode <= 122;
  });
}

function squareNameToIndex(squareName) {
  return rawFromRankFile(rankToIndex(squareName[1]), fileToIndex(squareName[0]));
}

function fileToIndex(fileChar) {
  return fileChar.charCodeAt(0) - 97;
}

function rankToIndex(rankChar) {
  return parseInt(rankChar) - 1;
}

function indexToSquareName(squareIndex) {
  return fileIndexToFile(fileFromRaw(squareIndex)) + rankIndexToRank(rankFromRaw(squareIndex));
}

function fileIndexToFile(fileIndex) {
  return String.fromCharCode(fileIndex + 97);
}

function rankIndexToRank(rankIndex) {
  return (rankIndex + 1).toString()
}

function NotationProcessor(chessBoard) {
  this.board = chessBoard;
}

NotationProcessor.prototype = {
  parseUCIMove: function(uciMove) {
    var promotion = null;
    if(uciMove.length > 4) {
      uciMove = uciMove.slice(0, 4);
      promotion = uciMove[4];
    }
    return this.buildMoveFromSquareNames(
      uciMove.slice(0, 2),
      uciMove.slice(2, 2),
      promotion
    );
  },
  parseAlgebraicMove: function(algebraicMove) {
    _.each(' \n+#!?', function(character) {
      algebraicMove = algebraicMove.replace(character, '');
    });

    // Handle castling.
    var backRankIndex = this.board.action == WHITE ? 0 : 7;
    if(algebraicMove.toUpperCase() == "O-O") {
      return buildMove(backRankIndex, 4, backRankIndex, 6, this.board);
    }
    if(algebraicMove.toUpperCase() == "O-O-O") {
      return buildMove(backRankIndex, 4, backRankIndex, 2, this.board);
    }
 
    if(algebraicMove[0].isLower()) return this.parsePawnMove(algebraicMove);
      
    var sourceFile = null;
    var sourceRank = null;
    var pieceType = pieces[algebraicMove[0].toLowerCase()];
    var disambiguation = algebraicMove.slice(1, -2).replace('x', '');
    var destination = squareNameToIndex(algebraicMove.slice(-2));

    if(disambiguation) {
      if(disambiguation.length > 2) throw "Invalid notation";
      if(disambiguation.length == 2)
        return new Move(squareNameToIndex(disambiguation), destination);
      else {
        sourceRank = rankToIndex(disambiguation);
        if(isNaN(sourceRank)) {
          // The disambiguation is actually a file.
          sourceRank = null;
          sourceFile = fileToIndex(disambiguation);
        }
      }
    }
    var source = pieceType.find(this.board, destination, sourceRank, sourceFile);
    if(!_.isNumber(source)) return;
    return new Move(source, destination, this.board);
  },
  parsePawnMove: function(algebraicMove) {
    algebraicMove = algebraicMove.replace("e.p.", "");
    var promotion = null;

    var equalsPosition = algebraicMove.indexOf('=')
    if(!(equalsPosition < 0)) {
      promotion = pieces[algebraicMove.slice(equalsPosition + 1).toLowerCase()];
      algebraicMove = algebraicMove.slice(0, equalsPosition);
    }

    var destinationIndex = squareNameToIndex(algebraicMove.slice(algebraicMove.length - 2));
    var destinationRank = rankFromRaw(destinationIndex);
    var destinationFile = fileFromRaw(destinationIndex);
    var sourceIndex;
    var disambiguation = algebraicMove.slice(0, algebraicMove.length - 2);
    var doubleMoveRank = this.board.action == WHITE ? 3 : 4;
    if(disambiguation) {
      sourceIndex = rawFromRankFile(
        destinationRank - this.board.action,
        fileToIndex(disambiguation[0])
      );
    } else if(
      destinationRank == doubleMoveRank &&
        this.board.getPiece(destinationRank - this.board.action, destinationFile).color == NONE
    ) {
      sourceIndex = rawFromRankFile(destinationRank - 2 * this.board.action, destinationFile);
    } else {
      sourceIndex = rawFromRankFile(destinationRank - this.board.action, destinationFile);
    }
    return new Move(sourceIndex, destinationIndex, this.board, promotion);
  },
  parseMoveFromSquareNames: function(source, dest, promotion) {
    return new Move(squareNameToIndex(source), squareNameToIndex(dest), promotion);
  }
}
