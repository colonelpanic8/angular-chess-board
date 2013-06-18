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
    _.each(' \n+#!?', function(character) {
      algebraicMove = algebraicMove.replace(character, '');
    });

    // Handle castling.
    var backRankIndex = this.board.action == WHITE ? 0 : 7;
    if(algebraicMove.toUpperCase() == "O-O") {
      return buildMove(backRankIndex, 4, backRankIndex, 6);
    }
    if(algebraicMove.toUpperCase() == "O-O-O") {
      return buildMove(backRankIndex, 4, backRankIndex, 2);
    }
 
    if(algebraicMove[0].isLower()) {
      return this.parsePawnMove(algebraicMove);
    } else {
      var sourceFile = null;
      var sourceRank = null;
      var pieceType = algebraicMove[0];
      var disambiguation = algebraicMove.slice(1, -2).replace('x', '');
      var destination = squareNameToIndex(algebraicMove.slice(-2));

      if(disambiguation) {
        if(disambiguation.length > 2) throw "Invalid notation";
        if(disambiguation.length == 2)
          return new Move(squareNameToIndex(disambiguation), destination);
        else {
          sourceRank = rankToIndex(disambiguation);
          if(sourceRank == NaN) {
            sourceRank = null;
            sourceFile = fileToIndex(disambiguation);
          }
        }
      }

      
    }
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
    } else if(destinationRank == doubleMoveRank &&
              this.board.getPiece(destinationRank - this.board.action, destinationFile).color == NONE) {
      sourceIndex = rawFromRankFile(destinationRank - 2 * this.board.action, destinationFile);
    } else {
      sourceIndex = rawFromRankFile(destinationRank - this.board.action, destinationFile);
    }
    return new Move(sourceIndex, destinationIndex, promotion);
  },
  buildMoveFromSquareNames: function(source, dest, promotion) {
    
  }
}