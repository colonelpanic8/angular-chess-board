var moves = ["e4", "e5", "Nf3", "Nc6", "Bc4", "d6", "c3", "a6", "d4", "exd4", "cxd4", "Bd7", "Nc3", "Na5", "Bxf7+", "Kxf7", "Ng5+", "Ke8", "Qf3", "Qf6", "Bf4", "Ne7", "O-O", "h6", "e5", "Qg6", "exd6", "hxg5", "dxe7", "gxf4", "exf8=Q+", "Rxf8", "Rae1+", "Kd8", "Nd5", "Qc6", "Rc1", "Qd6", "Nxc7", "Rc8", "Nd5", "Bc6", "Rfe1", "Bxd5", "Rxc8+", "Kxc8", "Qg4+", "Qd7", "Rc1+", "Kd8", "Qg5+", "Qe7", "Rc8+", "Kd7", "Rc7+", "Kxc7", "Qxe7+"];

describe("Chess Game", function() {
  beforeEach(setupChessBoardAndMatchers);

  it("can handle a huge game", function() {
    _.each(_.map(moves, function(move) {
      return this.chessGame.makeMoveFromAlgebraic(move);
    }, this), function(move, index) {
      expect(move.algebraic).toBe(moves[index]);
    });
  });

  it("provides a working interface to undo moves", function() {
    var originalState = this.chessGame.gameState();
    _.each(_.map(moves, function(algebraicMove) {
      return this.chessGame.makeMoveFromAlgebraic(algebraicMove);
    }, this), function(move) {
      this.chessGame.undoLastMove(move);
    }, this);
    expect(originalState).toBeThePosition(this.chessGame.gameState());
  });

  it("properly finds pieces by triangulation", function() {
    var moves = ['e4', 'e6', 'Nf3', 'c6', 'd4', 'c5', 'c3', 'h6', 'Bd3', 'Nf6', 'Bf4', 'Nc6', 'Nbd2', 'd6', 'O-O', 'Qc7', 'dxc5', 'e5', 'cxd6', 'Qxd6', 'Nxe5', 'Qxd3', 'Nxd3', 'Be7', 'Qb3', 'O-O', 'Nf3', 'Nxe4', 'Rfe1', 'Bf5', 'Qxb7', 'Rac8', 'Nfe5', 'Nxe5', 'Nxe5', 'Bd6', 'Qxa7', 'Bxe5', 'Bxe5', 'f6', 'Bd4', 'Ra8', 'Qe7', 'Rae8', 'Qb4', 'Rb8', 'Qc4+', 'Kh8', 'b3', 'Rbc8', 'Qb4', 'Rb8', 'Qa3', 'Ra8', 'Qb2', 'Rad8', 'f3', 'Ng5', 'h4', 'Ne6', 'Bb6', 'Rde8', 'Re2', 'Rf7'];
    _.each(_.map(moves, function(move) {
      return this.chessGame.makeMoveFromAlgebraic(move);
    }, this), function(move, index) {
      expect(move.algebraic).toBe(moves[index]);
    });
    
  });

  it("properly disambiguates", function() {
    var moves = ['d4', 'd5', 'Nf3', 'Nc6', 'e3', 'Bf5', 'Bd3', 'Nh6', 'Bxf5', 'Nxf5', 'a3', 'e6', 'Nbd2', 'Bd6', 'O-O', 'Qf6', 'Re1', 'Qg6', 'e4', 'Nfe7', 'exd5', 'Nxd5', 'c4', 'Nf4', 'g3', 'Nh3+', 'Kg2', 'Ng5', 'Ne4', 'Nxe4', 'c5', 'Be7', 'Ne5', 'Nxe5', 'dxe5', 'Bxc5', 'Be3', 'Bxe3', 'Rxe3', 'Nc5', 'b4', 'Nd7', 'Rc1', 'O-O-O', 'Rec3', 'c6', 'b5', 'Nxe5', 'Qa4', 'Kb8', 'bxc6', 'Nxc6', 'Rb3', 'Rc8', 'Rxc6']
    _.each(_.map(moves, function(move) {
      return this.chessGame.makeMoveFromAlgebraic(move);
    }, this), function(move, index) {
      expect(move.algebraic).toBe(moves[index]);
    });
  });
});
