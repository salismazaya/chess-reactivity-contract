// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

import "./Chess.sol";

contract Game {
    event GameCreated(uint256 gameId, address player1);
    event PlayerJoined(uint256 gameId, address player2);
    event GameEnd(uint256 gameId, uint8 outcome);
    event Move(
        uint256 gameId,
        uint256 gameState,
        uint16 moveValue,
        bool player1Turn
    );

    Chess public chess;

    struct GameStatus {
        uint256 gameState;
        uint32 player1State;
        uint32 player2State;
        address player1;
        address player2;
        bool player1Turn;
        uint16[] moves;
    }

    uint256 nextGameId;

    mapping(uint256 => GameStatus) games;

    constructor() {
        chess = new Chess();
    }

    function createGame() public {
        uint256 gId = nextGameId++;
        games[gId] = GameStatus({
            gameState: chess.game_state_start(),
            player1State: chess.initial_white_state(),
            player2State: chess.initial_black_state(),
            player1: msg.sender,
            player2: address(0),
            player1Turn: true,
            moves: new uint16[](0)
        });
        emit GameCreated(gId, msg.sender);
    }

    function joinGame(uint256 gId) public {
        require(games[gId].player1 != address(0), "Game does not exist");
        require(games[gId].player1 != msg.sender, "You are already player1");
        require(games[gId].player2 == address(0), "Game already joined");
        games[gId].player2 = msg.sender;
        emit PlayerJoined(gId, msg.sender);
    }

    function move(uint256 gId, uint16 moveValue) public {
        GameStatus storage g = games[gId];
        require(g.player2 != address(0), "Waiting for second player");
        require(
            g.player1 == msg.sender || g.player2 == msg.sender,
            "Not your game"
        );
        require(g.player1Turn == (msg.sender == g.player1), "Not your turn");

        uint32 pState;
        uint32 oState;
        bool isBlack;

        if (g.player1Turn) {
            pState = g.player1State;
            oState = g.player2State;
            isBlack = false;
        } else {
            pState = g.player2State;
            oState = g.player1State;
            isBlack = true;
        }

        (g.gameState, pState, oState) = chess.verifyExecuteMove(
            g.gameState,
            moveValue,
            pState,
            oState,
            isBlack
        );

        if (g.player1Turn) {
            g.player1State = pState;
            g.player2State = oState;
        } else {
            g.player2State = pState;
            g.player1State = oState;
        }

        g.player1Turn = !g.player1Turn;
        g.moves.push(moveValue);

        uint8 endgameOutcome = chess.checkEndgame(
            g.gameState,
            g.player1Turn ? g.player1State : g.player2State,
            g.player1Turn ? g.player2State : g.player1State
        );

        emit Move(gId, g.gameState, moveValue, g.player1Turn);

        if (endgameOutcome != 0) {
            uint8 finalOutcome = 3; // Default Draw (Stalemate = 1)
            if (endgameOutcome == 2) {
                // Checkmate! The current player (whose turn it is NOW) lost.
                finalOutcome = g.player1Turn ? 2 : 1;
            }
            emit GameEnd(gId, finalOutcome);
        }
    }

    function getGame(
        uint256 gId
    )
        public
        view
        returns (
            uint256 gameState,
            address player1,
            address player2,
            bool player1Turn
        )
    {
        GameStatus storage g = games[gId];
        return (g.gameState, g.player1, g.player2, g.player1Turn);
    }

    function getMoves(uint256 gId) public view returns (uint16[] memory) {
        return games[gId].moves;
    }
}
