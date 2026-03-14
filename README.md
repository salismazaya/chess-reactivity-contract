# Chess Smart Contract

This project contains the smart contracts for the on-chain chess game.

**Repositories:**
- **Smart Contract:** [https://github.com/salismazaya/chess-reactivity-contract](https://github.com/salismazaya/chess-reactivity-contract)
- **Frontend:** [https://github.com/salismazaya/chess-reactivity-frontend](https://github.com/salismazaya/chess-reactivity-frontend)

# Chess Reactivity  
**Fully On-Chain Chess Powered by Somnia Reactivity**

Play chess directly on the blockchain — no centralized server, no trusted third party.  
Each move, game state, and result is recorded on-chain, while the frontend reacts to blockchain events in real time using **Somnia Reactivity**.

---

# Overview

Chess Reactivity is a **peer-to-peer chess game fully powered by smart contracts**.  
Players interact directly with the blockchain to create games, join matches, and make moves.

The frontend listens to blockchain events using **Somnia Reactivity**, allowing the game interface to update automatically whenever something happens on-chain.

This architecture ensures:

- No centralized backend
- Transparent gameplay
- Trustless interaction between players
- Real-time UI updates from blockchain events

---

# Key Features

### Fully On-Chain Gameplay
All game actions are executed through smart contracts.

- Create a game
- Join a game
- Make a move
- End a game

Everything is recorded on-chain.

---

### Real-Time Updates with Reactivity

The frontend listens to smart contract events using **Somnia Reactivity**, enabling instant updates without polling or centralized infrastructure.

When a player makes a move, the event is emitted by the smart contract and instantly processed by the client.

---

### Peer-to-Peer Architecture

Players interact directly with the smart contract.

```

Player 1 → Smart Contract ← Player 2
↓
Reactivity Events
↓
Frontend

```

No backend server is required.

---

# Architecture

```

+-------------+        +--------------------+
|  Player 1   |        |     Player 2       |
+-------------+        +--------------------+
\                    /
\                  /
\                /
v              v
+----------------------+
|   Chess SmartContract|
+----------------------+
|
| Emits Events
|
v
+----------------------+
|  Somnia Reactivity   |
+----------------------+
|
v
+----------------------+
|      Frontend UI     |
+----------------------+

````

The UI automatically reacts to on-chain events.

---

# Smart Contract Events

The smart contract emits events whenever the game state changes.

```solidity
event GameCreated(uint256 gameId, address player1);
event PlayerJoined(uint256 gameId, address player2);
event GameEnd(uint256 gameId, uint8 outcome);
event Move(
    uint256 gameId,
    uint256 gameState,
    uint16 moveValue,
    bool player1Turn
);
````

### Event Descriptions

**GameCreated**

Emitted when a player creates a new chess game.

**PlayerJoined**

Triggered when another player joins the match.

**Move**

Emitted whenever a player performs a chess move.

**GameEnd**

Emitted when the game finishes.

---

# Reactivity Integration

The frontend subscribes to smart contract events using **Somnia Reactivity SDK**.

```javascript
ctx.reactivitySDK.subscribe({
    ethCalls: [],
    eventContractSources: [GAME_ADDRESS],
    topicOverrides: [],
    onData: (data) => {
        handleGameEvent(data);
    }
});
```

Whenever an event occurs on-chain, the `onData` function receives the event payload and processes it as a game update.

This allows the UI to reflect the latest game state instantly.

---

# Event Flow

```
Player makes move
        |
        v
Smart Contract executes transaction
        |
        v
Move event emitted
        |
        v
Somnia Reactivity detects event
        |
        v
Frontend receives event
        |
        v
Game board updates
```

This creates a **real-time blockchain-driven game loop**.

---

# Why Reactivity

Traditional blockchain applications rely on:

* Polling RPC nodes
* Backend event listeners
* Indexing services

With **Somnia Reactivity**, the frontend can directly react to blockchain activity, enabling:

* Real-time updates
* Lower infrastructure complexity
* Fully decentralized architecture

---

# Technology Stack

* **Solidity** — Smart contracts
* **Somnia Reactivity SDK** — Event-driven blockchain updates
* **React / Web Frontend** — Game interface
* **EVM-Compatible Network** — Smart contract execution

---

# How to Run

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

---

# Demo

Play the game:

[https://chess-reactivity.vercel.app](https://chess-reactivity.vercel.app)

---

# Vision

Chess Reactivity demonstrates how **real-time interactive applications can run entirely on blockchain infrastructure**.

Instead of centralized servers managing state, the blockchain becomes the **source of truth**, and the UI simply reacts to its events.

This model can be extended to:

* Multiplayer games
* On-chain strategy games
* Real-time decentralized applications
* Autonomous gaming ecosystems

## Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Steps

1. Install dependencies:
   ```shell
   npm install
   ```

2. Compile the smart contracts:
   ```shell
   npx hardhat compile
   ```

3. Run tests to ensure everything is working correctly:
   ```shell
   npx hardhat test
   ```

## Useful Commands

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
```
