const hre = require("hardhat");

async function main() {
    // Use the address from your frontend .env or deployment log
    const gameAddress = process.env.GAME_ADDRESS || "0x1478F46D0095E1Baeb13bf1c2dAF8A254bfE87dD";

    console.log(`Getting chess variable from Game contract at: ${gameAddress}`);

    const Game = await hre.ethers.getContractAt("Game", gameAddress);
    const chessAddress = await Game.chess();

    console.log("-----------------------------------------");
    console.log(`Chess Contract Address: ${chessAddress}`);
    console.log("-----------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
