describe("ChessBoard", function() {
  var chessBoard;

  function clearChessBoard() {
    _.each(_.range(64), function(index) {
      if(!(chessBoard.getPieceRaw(index) instanceof King))
        chessBoard.setPieceRaw(index);
    });
  }

  function makeLegalPromotion() {
    chessBoard.makeLegalMove(buildMove.apply(undefined, arguments));
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

  beforeEach(function() {
    chessBoard = new ChessBoard();
    clearChessBoard(chessBoard);
  });

  it("should not allow placing the king in check", function() {
    chessBoard.makeLegalMove(buildMove(1, 4, 3, 4));
    chessBoard.makeLegalMove(buildMove(6, 3, 4, 3));
    chessBoard.makeLegalMove(buildMove(0, 4, 1, 4));
    chessBoard.makeLegalMove(buildMove(4, 3, 3, 4));
    chessBoard.makeLegalMove(buildMove(1, 4, 2, 4));
    chessBoard.makeLegalMove(buildMove(7, 3, 2, 3));
  });

  // it("handles en passant", function() {
  //   self.chess_board[6][0] = 'P'
  //   self.chess_board[4][1] = 'p'
  //   	self.chess_rules.action = common.BLACK
  //   	self.make_legal_moves([((6, 0), (4, 0)), ((4, 1), (5, 0))])
  //   	T.assert_equal(self.chess_board.is_empty_square(4, 0), True)
  //   	T.assert_equal(self.chess_board[5][0], 'p')

  //   	self.chess_board[1][6] = 'p'
  //   	self.chess_board[3][7] = 'P'
  //   	self.chess_rules.action = common.WHITE
  //   	self.make_legal_moves([((1, 6), (3, 6)), ((3, 7), (2, 6))])
  //   	T.assert_equal(self.chess_board.is_empty_square(3, 6), True)
  //   	T.assert_equal(self.chess_board[2][6], 'P')
  // });

// 	def test_en_passant(self):
		

// 	def test_basic_promotion(self):
// 		self.make_legal_moves([((0, 4), (1, 4)), ((7, 4), (6, 4))])
// 		self.chess_board[6][0] = 'p'
// 		self.chess_board[1][0] = 'P'

// 		T.assert_raises(
// 			common.IllegalMoveError,
// 			self.make_legal_move,
// 			(6, 0), (7, 0)
// 		)
// 		self.make_legal_promotion((6, 0), (7, 0), promotion='Q')
// 		T.assert_equal(self.chess_board[7][0], 'q')

// 		self.make_legal_promotion((1, 0), (0, 0), promotion='Q')
// 		T.assert_equal(self.chess_board[0][0], 'Q')

// 	def test_queenside_castling_and_castling_through_check(self):
// 		self.chess_board[0][0] = 'r'
// 		self.chess_board[7][0] = 'R'
// 		self.make_legal_move((0, 4), (0, 2))
// 		T.assert_equal(self.chess_board[0][2], 'k')
// 		T.assert_equal(self.chess_board[0][3], 'r')
// 		T.assert_equal(self.chess_board[0][4], None)
// 		T.assert_equal(self.chess_board[0][0], None)

// 		# This should raise because the rook blocks the castling of the black king
// 		T.assert_raises(
// 			common.IllegalMoveError,
// 			self.make_legal_move,
// 			(7, 4), (7, 2)
// 		)
// 		self.chess_board[0][3] = None
// 		self.make_legal_move((7, 4), (7, 2))
// 		T.assert_equal(self.chess_board[7][2], 'K')
// 		T.assert_equal(self.chess_board[7][3], 'R')


// class DefaultBoardChessRulesTestCase(BasePlayableChessGameTestCase):

// 	moves_for_castling = [
// 		((1, 4), (3, 4)),
// 		((6, 4), (4, 4)),
// 		((0, 6), (2, 5)),
// 		((7, 6), (5, 5)),
// 		((0, 5), (1, 4)),
// 		((7, 5), (6, 4)),
// 	]

// 	def test_kingside_castling_fails_when_rook_moves_back_into_position(self):
// 		self.make_legal_moves(self.moves_for_castling)
// 		self.make_legal_moves([
// 			((0, 7), (0, 6)),
// 			((7, 7), (7, 6)),
// 			((0, 6), (0, 7)),
// 			((7, 6), (7, 7))
// 		])

// 		T.assert_raises(
// 			common.IllegalMoveError,
// 			self.make_legal_move,
// 			(0, 4), (0, 6)
// 		)

// 		self.make_legal_move((0, 4), (0, 5))

// 		T.assert_raises(
// 			common.IllegalMoveError,
// 			self.make_legal_move,
// 			(7, 4), (7, 6)
// 		)

// 	def test_kingside_castling_and_castling_while_in_check(self):
// 		for move_num, move in enumerate(self.moves_for_castling):
// 			rank = move_num % 2 * 7
// 			assert (rank, 6) not in self.chess_rules.get_legal_moves(rank, 4)
// 			self.make_legal_move(*move)

// 		self.make_legal_move((0, 4), (0, 6))
// 		T.assert_equal(self.chess_board[0][6], 'k')
// 		T.assert_equal(self.chess_board[0][5], 'r')
// 		T.assert_equal(self.chess_board[0][4], None)
// 		T.assert_equal(self.chess_board[0][7], None)

// 		self.chess_board[6][4] = 'r'
// 		T.assert_raises(
// 			common.IllegalMoveError,
// 			self.make_legal_move,
// 			(7, 4), (7, 6)
// 		)
// 		self.chess_board[6][4] = None
// 		self.make_legal_move((7, 4), (7, 6))
// 		T.assert_equal(self.chess_board[7][6], 'K')
// 		T.assert_equal(self.chess_board[7][5], 'R')

// 	def test_get_item_of_chess_board(self):
// 		T.assert_equal(self.chess_board[0][0], 'r')

// 	def test_get_legal_moves_with_queen_and_double_check(self):
// 		self.chess_board[1][4] = 'q'
// 		self.chess_board[2][5] = 'P'
// 		self.chess_board[5][0] = 'b'

// 		all_moves = set()
// 		# All the straight moves.
// 		all_moves.update([(i, 4) for i in range (2, 7)])
// 		# Should be able to take the blocking pawn.
// 		all_moves.add((2, 5))
// 		# Up to the blocking bishop.
// 		all_moves.update([(1 + i, 4 - i) for i in range(1,4)])
// 		T.assert_sets_equal(
// 			set(self.chess_rules.get_legal_moves(1,4)),
// 			all_moves
// 		)
// 		self.chess_board[1][5] = None

// 		all_moves.add((1, 5))

// 		T.assert_sets_equal(
// 			set(self.chess_rules.get_legal_moves(1,4)),
// 			set(all_moves)
// 		)

// 		# The only available moves should be on the current file.
// 		self.chess_board[4][4] = 'R'
// 		T.assert_sets_equal(
// 			set(self.chess_rules.get_legal_moves(1,4)),
// 			set([(i,4) for i in range(2,5)])
// 		)

// 		# There should be no available moves because of the double check.
// 		self.chess_board.set_piece(1, 5, 'B')
// 		T.assert_sets_equal(set(self.chess_rules.get_legal_moves(1,4)), set())

// 		# The king has to take.
// 		T.assert_sets_equal(set(self.chess_rules.get_legal_moves(0,4)), set([(1,5)]))

// 	def test_get_legal_moves_for_rook_with_capture(self):
// 		self.chess_board._board[1][0] = None
// 		T.assert_sets_equal(
// 			set(self.chess_rules.get_legal_moves(0, 0)),
// 			set([(i, 0) for i in range (1, 7)])
// 		)

// 	def test_get_legal_moves_for_rook_without_capture(self):
// 		self.chess_rules.make_legal_move(common.MoveInfo((1, 0), (3, 0)))
// 		self.chess_rules.make_legal_move(common.MoveInfo((6, 0), (4, 0)))
// 		T.assert_sets_equal(
// 			set(self.chess_rules.get_legal_moves(0, 0)),
// 			set([(i, 0) for i in range (1, 3)])
// 		)
// 		T.assert_sets_equal(set(self.chess_rules.get_legal_moves(3, 0)), set())
// 		self.chess_rules.make_legal_move(common.MoveInfo((1, 1), (3, 1)))
// 		T.assert_sets_equal(set(self.chess_rules.get_legal_moves(4, 0)), set([(3, 1)]))

// 	def test_double_pawn_move(self):
// 		self.make_legal_move((1, 3), (3, 3))
// 		self.make_legal_move((6, 3), (4, 3))
// 		T.assert_equal(self.chess_board[3][3], 'p')
// 		T.assert_equal(self.chess_board[4][3], 'P')

// 		self.chess_board[3][7] = 'P'
// 		T.assert_raises(
// 			common.IllegalMoveError,
// 			self.make_legal_move,
// 			(1, 7), (3, 7)
// 		)

// 		self.chess_board[2][6] = 'p'
// 		T.assert_raises(
// 			common.IllegalMoveError,
// 			self.make_legal_move,
// 			(1, 6), (3, 6)
// 		)
// 	def test_active_color_error(self):
// 		T.assert_raises(
// 			common.ActiveColorError,
// 			self.chess_rules.get_legal_moves,
// 			7, 0
// 		)

// 		self.chess_rules.make_legal_move(common.MoveInfo((1, 0), (3, 0)))

// 		T.assert_raises(
// 			common.ActiveColorError,
// 			self.chess_rules.get_legal_moves,
// 			0, 0
// 		)
  
});
