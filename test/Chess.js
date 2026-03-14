const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chess", function () {
    let Chess;
    let chess;

    beforeEach(async function () {
        Chess = await ethers.getContractFactory("Chess");
        chess = await Chess.deploy();
    });

    describe("Constants", function () {
        it("Should have correct starting game state", async function () {
            const startState = await chess.game_state_start();
            expect(startState).to.equal(BigInt("0xcbaedabc99999999000000000000000000000000000000001111111143265234"));
        });

        it("Should have correct initial player states", async function () {
            expect(await chess.initial_white_state()).to.equal(0x000704ff);
            expect(await chess.initial_black_state()).to.equal(0x383f3cff);
        });
    });

    describe("Movement Logic", function () {
        it("Should verify and execute a valid pawn move", async function () {
            const startState = await chess.game_state_start();
            const whiteState = await chess.initial_white_state();
            const blackState = await chess.initial_black_state();

            // e2-e4: (12 << 6) | 28 = 796
            const move = 796;
            const [newState, newPlayerState, newOpponentState] = await chess.verifyExecuteMove(
                startState,
                move,
                whiteState,
                blackState,
                false // currentTurnBlack
            );

            expect(newState).to.not.equal(BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
            // Piece at 12 (e2) should be 0
            expect(await chess.pieceAtPosition(newState, 12)).to.equal(0);
            // Piece at 28 (e4) should be pawn (1)
            expect(await chess.pieceAtPosition(newState, 28)).to.equal(1);
        });

        it("Should revert on move with wrong color piece", async function () {
            const startState = await chess.game_state_start();
            const whiteState = await chess.initial_white_state();
            const blackState = await chess.initial_black_state();

            // Black tries to move white piece at e2
            const move = 796;
            await expect(chess.verifyExecuteMove(startState, move, blackState, whiteState, true))
                .to.be.revertedWith("inv move color");
        });

        it("Should detect checkmate in a sequence (Fool's Mate)", async function () {
            let state = await chess.game_state_start();
            let whiteState = await chess.initial_white_state();
            let blackState = await chess.initial_black_state();

            // 1. f2-f3
            [state, whiteState, blackState] = await chess.verifyExecuteMove(state, (13 << 6) | 21, whiteState, blackState, false);
            // 2. e7-e5
            [state, blackState, whiteState] = await chess.verifyExecuteMove(state, (52 << 6) | 36, blackState, whiteState, true);
            // 3. g2-g4
            [state, whiteState, blackState] = await chess.verifyExecuteMove(state, (14 << 6) | 30, whiteState, blackState, false);
            // 4. d8-h4
            [state, blackState, whiteState] = await chess.verifyExecuteMove(state, (59 << 6) | 31, blackState, whiteState, true);

            // Check for checkmate
            const outcome = await chess.checkEndgame(state, whiteState, blackState);
            expect(outcome).to.equal(2); // checkmate
        });
    });

    describe("Position Helpers", function () {
        it("Should correctly identify pieces at positions", async function () {
            const startState = await chess.game_state_start();
            // a1 = 0, contains white rook (4)
            expect(await chess.pieceAtPosition(startState, 0)).to.equal(4);
            // e1 = 4, contains white king (6)
            expect(await chess.pieceAtPosition(startState, 4)).to.equal(6);
            // e8 = 60, contains black king (6 | 8 = 14)
            expect(await chess.pieceAtPosition(startState, 60)).to.equal(14);
        });
    });
});
