function King(color) {
  
}
function Queen(color) {
  this.color = color
}
function Rook(color) {
}
Queen.moves

function chessBoard() {
  this.resetBoard()
}

chessBoard.prototype.resetBoard = function() {
  this.board = []
  for (var i = 0; i < 64; i++) {
    this.board.push(null);
  }
  
}
chessBoard.makeMoveRowsCols = function(src_row, src_col, dst_row, dst_col) {
  
}
chessBoard.prototype.makeMove = function(src, dst) {
}
angular.module('chessBoard').factory('chessBoard', function () {
  return chessBoard
})
