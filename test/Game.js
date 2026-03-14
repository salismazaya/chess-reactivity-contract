const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Game", function () {
    let Game;
    let game;
    let owner;
    let addr1;
    let addr2;
    let addr3;

    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        Game = await ethers.getContractFactory("Game");
        game = await Game.deploy();
    });

    describe("Game Management", function () {
        it("Should create a new game", async function () {
            await expect(game.connect(addr1).createGame())
                .to.emit(game, "GameCreated")
                .withArgs(0, addr1.address);
        });

        it("Should allow a second player to join and emit PlayerJoined", async function () {
            await game.connect(addr1).createGame();
            await expect(game.connect(addr2).joinGame(0))
                .to.emit(game, "PlayerJoined")
                .withArgs(0, addr2.address);
        });

        it("Should prevent player1 from joining their own game", async function () {
            await game.connect(addr1).createGame();
            await expect(game.connect(addr1).joinGame(0))
                .to.be.revertedWith("You are already player1");
        });

        it("Should revert if joining a non-existent game", async function () {
            await expect(game.connect(addr1).joinGame(999))
                .to.be.revertedWith("Game does not exist");
        });

        it("Should prevent a third player from joining", async function () {
            await game.connect(addr1).createGame();
            await game.connect(addr2).joinGame(0);
            await expect(game.connect(addr3).joinGame(0))
                .to.be.revertedWith("Game already joined");
        });
    });

    describe("Moves", function () {
        beforeEach(async function () {
            await game.connect(addr1).createGame();
        });

        it("Should revert if white tries to move before black joins", async function () {
            const moveE2E4 = (12 << 6) | 28;
            await expect(game.connect(addr1).move(0, moveE2E4))
                .to.be.revertedWith("Waiting for second player");
        });

        it("Should allow white to move after black joins", async function () {
            await game.connect(addr2).joinGame(0);
            const moveE2E4 = (12 << 6) | 28;
            await expect(game.connect(addr1).move(0, moveE2E4)).to.not.be.reverted;
        });

        it("Should revert if black tries to move first", async function () {
            await game.connect(addr2).joinGame(0);
            const moveE7E5 = (52 << 6) | 36;
            await expect(game.connect(addr2).move(0, moveE7E5)).to.be.revertedWith("Not your turn");
        });

        it("Should revert if non-player tries to move", async function () {
            await game.connect(addr2).joinGame(0);
            const moveE2E4 = (12 << 6) | 28;
            await expect(game.connect(addr3).move(0, moveE2E4)).to.be.revertedWith("Not your game");
        });

        it("Should allow alternating turns", async function () {
            await game.connect(addr2).joinGame(0);
            const moveE2E4 = (12 << 6) | 28;
            const moveE7E5 = (52 << 6) | 36;

            await game.connect(addr1).move(0, moveE2E4);
            await expect(game.connect(addr2).move(0, moveE7E5)).to.not.be.reverted;

            const moveG1F3 = (6 << 6) | 21; // Ng1-f3
            await expect(game.connect(addr1).move(0, moveG1F3)).to.not.be.reverted;
        });

        it("Should revert on invalid chess move", async function () {
            await game.connect(addr2).joinGame(0);
            // Try to move a white pawn to an invalid position (e2 to e5)
            const invalidMove = (12 << 6) | 36;
            await expect(game.connect(addr1).move(0, invalidMove)).to.be.revertedWith("inv move");
        });

        it("Should detect checkmate (Fool's Mate)", async function () {
            await game.connect(addr2).joinGame(0);
            // 1. f2-f3 (13 -> 21)
            const move1 = (13 << 6) | 21;
            await game.connect(addr1).move(0, move1);

            // 2. e7-e5 (52 -> 36)
            const move2 = (52 << 6) | 36;
            await game.connect(addr2).move(0, move2);

            // 3. g2-g4 (14 -> 30)
            const move3 = (14 << 6) | 30;
            await game.connect(addr1).move(0, move3);

            // 4. d8-h4 (59 -> 31)
            const move4 = (59 << 6) | 31;
            await expect(game.connect(addr2).move(0, move4))
                .to.emit(game, "GameEnd")
                .withArgs(0, 2);
        });
    });
});
