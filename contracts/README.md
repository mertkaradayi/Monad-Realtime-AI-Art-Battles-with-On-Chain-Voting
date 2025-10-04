# BattleVoting Smart Contract

This directory contains the smart contract implementation for the AI Art Battle voting system on Monad testnet.

## Contract Overview

The `BattleVoting` contract manages on-chain voting for AI-generated art battles between two participants. It provides:

- Battle creation and management
- Secure voting mechanism
- Vote counting and winner determination
- Voting period management
- Event logging for transparency

## Features

### Core Functionality
- **Battle Creation**: Create battles with participants, prompts, and image URLs
- **Voting**: Cast votes for participants (one vote per address per battle)
- **Vote Counting**: Automatic vote tallying and winner determination
- **Time Management**: Configurable voting periods with extension capability
- **Access Control**: Only battle creators can manage their battles

### Security Features
- **Duplicate Vote Prevention**: Each address can only vote once per battle
- **Time-based Voting**: Voting automatically ends after specified duration
- **Input Validation**: Comprehensive validation of all inputs
- **Access Control**: Role-based permissions for battle management

## Contract Structure

### Battle Struct
```solidity
struct Battle {
    string battleId;           // UUID from database
    string concept;            // Battle concept/theme
    address participant1;      // Wallet address of participant 1
    address participant2;      // Wallet address of participant 2
    string participant1Prompt; // Prompt used by participant 1
    string participant2Prompt; // Prompt used by participant 2
    string participant1ImageUrl; // Generated image URL for participant 1
    string participant2ImageUrl; // Generated image URL for participant 2
    uint256 totalVotes;        // Total number of votes cast
    uint256 participant1Votes; // Votes for participant 1
    uint256 participant2Votes; // Votes for participant 2
    address winner;            // Winner address (address(0) if no winner yet)
    bool isActive;             // Whether voting is still active
    uint256 votingEndTime;     // Timestamp when voting ends
    address creator;           // Battle creator address
}
```

### Vote Struct
```solidity
struct Vote {
    address voter;             // Address of the voter
    address participant;       // Participant being voted for
    uint256 timestamp;         // When the vote was cast
}
```

## Events

- `BattleCreated`: Emitted when a new battle is created
- `VoteCast`: Emitted when a vote is cast
- `BattleCompleted`: Emitted when a battle is completed and winner determined
- `VotingExtended`: Emitted when voting period is extended

## Setup and Deployment

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Private key with MON testnet tokens for deployment
- Access to Monad testnet RPC

### Installation
```bash
# Install dependencies
forge install

# Compile contracts
forge build
```

### Configuration
1. Copy `env.example` to `.env`
2. Add your private key and RPC URL:
```bash
PRIVATE_KEY=your_private_key_here
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
```

### Deployment
```bash
# Deploy to Monad testnet
forge script script/DeployBattleVoting.s.sol --rpc-url $MONAD_TESTNET_RPC --broadcast

# Verify contract (optional)
forge verify-contract <contract_address> BattleVoting --chain 10143 --verifier sourcify --verifier-url https://sourcify-api-monad.blockvision.org
```

### Testing
```bash
# Run tests
forge test

# Run tests with verbose output
forge test -vvv

# Run specific test
forge test --match-test testCreateBattle
```

## Usage

### Creating a Battle
```solidity
battleVoting.createBattle(
    "battle-123",                    // battleId
    "Epic Space Battle",             // concept
    participant1Address,             // participant1
    participant2Address,             // participant2
    "A futuristic spaceship...",     // participant1Prompt
    "An alien planet with...",       // participant2Prompt
    "https://example.com/img1.jpg",  // participant1ImageUrl
    "https://example.com/img2.jpg",  // participant2ImageUrl
    24 hours                         // votingDuration
);
```

### Casting a Vote
```solidity
battleVoting.castVote("battle-123", participant1Address);
```

### Completing a Battle
```solidity
battleVoting.completeBattle("battle-123");
```

### Querying Battle Information
```solidity
BattleVoting.Battle memory battle = battleVoting.getBattle("battle-123");
Vote[] memory votes = battleVoting.getBattleVotes("battle-123");
bool hasVoted = battleVoting.hasVoterVoted("battle-123", voterAddress);
```

## Integration with Backend

The contract integrates with the backend system through:

1. **Battle Creation**: Backend creates battles when images are generated
2. **QR Code Generation**: Backend generates QR codes with contract address and battle ID
3. **Vote Tracking**: Backend can query contract for vote counts and results
4. **Event Monitoring**: Backend can listen to contract events for real-time updates

## Network Information

- **Network**: Monad Testnet
- **Chain ID**: 10143
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Block Explorer**: https://testnet.monadexplorer.com
- **Native Token**: MON (testnet)

## Gas Optimization

The contract is optimized for gas efficiency:
- Uses `uint256` for vote counts (packed storage)
- Minimal storage operations
- Efficient event logging
- Optimized Solidity version (0.8.24)

## Security Considerations

- **Access Control**: Only battle creators can manage their battles
- **Vote Integrity**: One vote per address per battle
- **Time Validation**: Voting periods are enforced on-chain
- **Input Validation**: All inputs are validated before processing
- **Reentrancy Protection**: No external calls that could cause reentrancy

## License

MIT License - see LICENSE file for details.