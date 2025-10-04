// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BattleVoting
 * @dev Smart contract for AI Art Battle voting on Monad testnet
 * @notice This contract manages voting for AI-generated art battles between two participants
 */
contract BattleVoting {
    // Battle information
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

    // Vote information
    struct Vote {
        address voter;             // Address of the voter
        address participant;       // Participant being voted for
        uint256 timestamp;         // When the vote was cast
    }

    // State variables
    mapping(string => Battle) public battles;           // battleId => Battle
    mapping(string => Vote[]) public battleVotes;       // battleId => Vote[]
    mapping(string => mapping(address => bool)) public hasVoted; // battleId => voter => hasVoted
    mapping(address => uint256) public voterVoteCount;  // voter => total votes cast across all battles
    
    // Events
    event BattleCreated(
        string indexed battleId,
        string concept,
        address indexed participant1,
        address indexed participant2,
        address creator,
        uint256 votingEndTime
    );
    
    event VoteCast(
        string indexed battleId,
        address indexed voter,
        address indexed participant,
        uint256 timestamp
    );
    
    event BattleCompleted(
        string indexed battleId,
        address indexed winner,
        uint256 participant1Votes,
        uint256 participant2Votes
    );
    
    event VotingExtended(
        string indexed battleId,
        uint256 newEndTime
    );

    // Modifiers
    modifier onlyBattleCreator(string memory battleId) {
        require(battles[battleId].creator == msg.sender, "Only battle creator can perform this action");
        _;
    }
    
    modifier battleExists(string memory battleId) {
        require(bytes(battles[battleId].battleId).length > 0, "Battle does not exist");
        _;
    }
    
    modifier votingActive(string memory battleId) {
        require(battles[battleId].isActive, "Voting is not active for this battle");
        require(block.timestamp <= battles[battleId].votingEndTime, "Voting period has ended");
        _;
    }
    
    modifier notVoted(string memory battleId) {
        require(!hasVoted[battleId][msg.sender], "Address has already voted in this battle");
        _;
    }

    /**
     * @dev Create a new battle for voting
     * @param battleId Unique identifier for the battle
     * @param concept Battle concept/theme
     * @param participant1 Wallet address of first participant
     * @param participant2 Wallet address of second participant
     * @param participant1Prompt Prompt used by participant 1
     * @param participant2Prompt Prompt used by participant 2
     * @param participant1ImageUrl Generated image URL for participant 1
     * @param participant2ImageUrl Generated image URL for participant 2
     * @param votingDuration Duration in seconds for voting (default 24 hours)
     */
    function createBattle(
        string memory battleId,
        string memory concept,
        address participant1,
        address participant2,
        string memory participant1Prompt,
        string memory participant2Prompt,
        string memory participant1ImageUrl,
        string memory participant2ImageUrl,
        uint256 votingDuration
    ) external {
        require(bytes(battleId).length > 0, "Battle ID cannot be empty");
        require(bytes(concept).length > 0, "Concept cannot be empty");
        require(participant1 != address(0), "Participant 1 address cannot be zero");
        require(participant2 != address(0), "Participant 2 address cannot be zero");
        require(participant1 != participant2, "Participants must be different");
        require(bytes(battles[battleId].battleId).length == 0, "Battle already exists");
        require(votingDuration > 0, "Voting duration must be greater than 0");
        require(votingDuration <= 7 days, "Voting duration cannot exceed 7 days");

        uint256 votingEndTime = block.timestamp + votingDuration;
        
        battles[battleId] = Battle({
            battleId: battleId,
            concept: concept,
            participant1: participant1,
            participant2: participant2,
            participant1Prompt: participant1Prompt,
            participant2Prompt: participant2Prompt,
            participant1ImageUrl: participant1ImageUrl,
            participant2ImageUrl: participant2ImageUrl,
            totalVotes: 0,
            participant1Votes: 0,
            participant2Votes: 0,
            winner: address(0),
            isActive: true,
            votingEndTime: votingEndTime,
            creator: msg.sender
        });

        emit BattleCreated(
            battleId,
            concept,
            participant1,
            participant2,
            msg.sender,
            votingEndTime
        );
    }

    /**
     * @dev Cast a vote for a participant
     * @param battleId Battle identifier
     * @param participant Address of the participant to vote for
     */
    function castVote(string memory battleId, address participant) 
        external 
        battleExists(battleId)
        votingActive(battleId)
        notVoted(battleId)
    {
        Battle storage battle = battles[battleId];
        require(
            participant == battle.participant1 || participant == battle.participant2,
            "Invalid participant address"
        );

        // Record the vote
        battleVotes[battleId].push(Vote({
            voter: msg.sender,
            participant: participant,
            timestamp: block.timestamp
        }));

        // Update vote counts
        battle.totalVotes++;
        voterVoteCount[msg.sender]++;
        hasVoted[battleId][msg.sender] = true;

        if (participant == battle.participant1) {
            battle.participant1Votes++;
        } else {
            battle.participant2Votes++;
        }

        emit VoteCast(battleId, msg.sender, participant, block.timestamp);
    }

    /**
     * @dev Complete the battle and determine winner
     * @param battleId Battle identifier
     */
    function completeBattle(string memory battleId) 
        external 
        battleExists(battleId)
        onlyBattleCreator(battleId)
    {
        Battle storage battle = battles[battleId];
        require(battle.isActive, "Battle is not active");
        require(
            block.timestamp > battle.votingEndTime || battle.totalVotes >= 10,
            "Voting period not ended and minimum votes not reached"
        );

        battle.isActive = false;

        // Determine winner
        if (battle.participant1Votes > battle.participant2Votes) {
            battle.winner = battle.participant1;
        } else if (battle.participant2Votes > battle.participant1Votes) {
            battle.winner = battle.participant2;
        }
        // If votes are equal, winner remains address(0) - tie

        emit BattleCompleted(
            battleId,
            battle.winner,
            battle.participant1Votes,
            battle.participant2Votes
        );
    }

    /**
     * @dev Extend voting period (only battle creator)
     * @param battleId Battle identifier
     * @param additionalTime Additional time in seconds
     */
    function extendVoting(string memory battleId, uint256 additionalTime) 
        external 
        battleExists(battleId)
        onlyBattleCreator(battleId)
    {
        Battle storage battle = battles[battleId];
        require(battle.isActive, "Battle is not active");
        require(additionalTime > 0, "Additional time must be greater than 0");
        require(additionalTime <= 3 days, "Cannot extend voting by more than 3 days");

        battle.votingEndTime += additionalTime;

        emit VotingExtended(battleId, battle.votingEndTime);
    }

    /**
     * @dev Get battle information
     * @param battleId Battle identifier
     * @return Battle struct
     */
    function getBattle(string memory battleId) 
        external 
        view 
        battleExists(battleId)
        returns (Battle memory)
    {
        return battles[battleId];
    }

    /**
     * @dev Get all votes for a battle
     * @param battleId Battle identifier
     * @return Array of Vote structs
     */
    function getBattleVotes(string memory battleId) 
        external 
        view 
        battleExists(battleId)
        returns (Vote[] memory)
    {
        return battleVotes[battleId];
    }

    /**
     * @dev Get vote count for a specific voter in a battle
     * @param battleId Battle identifier
     * @param voter Voter address
     * @return Whether the voter has voted
     */
    function hasVoterVoted(string memory battleId, address voter) 
        external 
        view 
        battleExists(battleId)
        returns (bool)
    {
        return hasVoted[battleId][voter];
    }

    /**
     * @dev Get total votes cast by an address across all battles
     * @param voter Voter address
     * @return Total vote count
     */
    function getVoterTotalVotes(address voter) external view returns (uint256) {
        return voterVoteCount[voter];
    }

    /**
     * @dev Check if voting is still active for a battle
     * @param battleId Battle identifier
     * @return Whether voting is active
     */
    function isVotingActive(string memory battleId) 
        external 
        view 
        battleExists(battleId)
        returns (bool)
    {
        Battle memory battle = battles[battleId];
        return battle.isActive && block.timestamp <= battle.votingEndTime;
    }

    /**
     * @dev Get time remaining for voting
     * @param battleId Battle identifier
     * @return Time remaining in seconds (0 if voting has ended)
     */
    function getVotingTimeRemaining(string memory battleId) 
        external 
        view 
        battleExists(battleId)
        returns (uint256)
    {
        Battle memory battle = battles[battleId];
        if (!battle.isActive || block.timestamp >= battle.votingEndTime) {
            return 0;
        }
        return battle.votingEndTime - block.timestamp;
    }
}
