const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ChessModule", (m) => {
    const game = m.contract("Game", []);

    return { game };
});
