// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/BattleVoting.sol";

/**
 * @title BattleVotingTest
 * @dev Test suite for BattleVoting contract
 */
contract BattleVotingTest is Test {
    BattleVoting public battleVoting;
    address public creator;
    address public participant1;
    address public participant2;
    address public voter1;
    address public voter2;
    address public voter3;

    string public constant BATTLE_ID = "test-battle-123";
    string public constant CONCEPT = "Epic Space Battle";
    string public constant PROMPT1 = "A futuristic spaceship in deep space";
    string public constant PROMPT2 = "An alien planet with two moons";
    string public constant IMAGE_URL1 = "https://example.com/image1.jpg";
    string public constant IMAGE_URL2 = "https://example.com/image2.jpg";

    function setUp() public {
        // Create test accounts
        creator = makeAddr("creator");
        participant1 = makeAddr("participant1");
        participant2 = makeAddr("participant2");
        voter1 = makeAddr("voter1");
        voter2 = makeAddr("voter2");
        voter3 = makeAddr("voter3");

        // Deploy contract
        battleVoting = new BattleVoting();
    }

    function testCreateBattle() public {
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            1 hours
        );

        // Verify battle was created
        BattleVoting.Battle memory battle = battleVoting.getBattle(BATTLE_ID);
        assertEq(battle.battleId, BATTLE_ID);
        assertEq(battle.concept, CONCEPT);
        assertEq(battle.participant1, participant1);
        assertEq(battle.participant2, participant2);
        assertEq(battle.participant1Prompt, PROMPT1);
        assertEq(battle.participant2Prompt, PROMPT2);
        assertEq(battle.participant1ImageUrl, IMAGE_URL1);
        assertEq(battle.participant2ImageUrl, IMAGE_URL2);
        assertEq(battle.creator, creator);
        assertTrue(battle.isActive);
        assertEq(battle.totalVotes, 0);
        assertEq(battle.participant1Votes, 0);
        assertEq(battle.participant2Votes, 0);
        assertEq(battle.winner, address(0));
    }

    function testCastVote() public {
        // Create battle first
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            1 hours
        );

        // Cast vote for participant1
        vm.prank(voter1);
        battleVoting.castVote(BATTLE_ID, participant1);

        // Verify vote was recorded
        BattleVoting.Battle memory battle = battleVoting.getBattle(BATTLE_ID);
        assertEq(battle.totalVotes, 1);
        assertEq(battle.participant1Votes, 1);
        assertEq(battle.participant2Votes, 0);
        assertTrue(battleVoting.hasVoterVoted(BATTLE_ID, voter1));
        assertEq(battleVoting.getVoterTotalVotes(voter1), 1);

        // Cast vote for participant2
        vm.prank(voter2);
        battleVoting.castVote(BATTLE_ID, participant2);

        // Verify second vote
        battle = battleVoting.getBattle(BATTLE_ID);
        assertEq(battle.totalVotes, 2);
        assertEq(battle.participant1Votes, 1);
        assertEq(battle.participant2Votes, 1);
        assertTrue(battleVoting.hasVoterVoted(BATTLE_ID, voter2));
        assertEq(battleVoting.getVoterTotalVotes(voter2), 1);
    }

    function testCompleteBattle() public {
        // Create battle
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            1 hours
        );

        // Cast votes (need at least 10 votes to complete early)
        address[10] memory voters = [
            makeAddr("voter1"), makeAddr("voter2"), makeAddr("voter3"), makeAddr("voter4"), makeAddr("voter5"),
            makeAddr("voter6"), makeAddr("voter7"), makeAddr("voter8"), makeAddr("voter9"), makeAddr("voter10")
        ];

        // Cast 6 votes for participant1 and 4 votes for participant2
        for (uint i = 0; i < 6; i++) {
            vm.prank(voters[i]);
            battleVoting.castVote(BATTLE_ID, participant1);
        }
        for (uint i = 6; i < 10; i++) {
            vm.prank(voters[i]);
            battleVoting.castVote(BATTLE_ID, participant2);
        }

        // Complete battle (now we have 10 votes, so it can be completed)
        vm.prank(creator);
        battleVoting.completeBattle(BATTLE_ID);

        // Verify battle completion
        BattleVoting.Battle memory battle = battleVoting.getBattle(BATTLE_ID);
        assertFalse(battle.isActive);
        assertEq(battle.winner, participant1); // participant1 has 6 votes, participant2 has 4
        assertEq(battle.totalVotes, 10);
        assertEq(battle.participant1Votes, 6);
        assertEq(battle.participant2Votes, 4);
    }

    function testExtendVoting() public {
        // Create battle
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            1 hours
        );

        // Extend voting
        vm.prank(creator);
        battleVoting.extendVoting(BATTLE_ID, 2 hours);

        // Verify extension
        BattleVoting.Battle memory battle = battleVoting.getBattle(BATTLE_ID);
        assertTrue(battle.votingEndTime > block.timestamp + 2 hours);
    }

    function testCannotVoteTwice() public {
        // Create battle
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            1 hours
        );

        // Cast first vote
        vm.prank(voter1);
        battleVoting.castVote(BATTLE_ID, participant1);

        // Try to vote again - should fail
        vm.prank(voter1);
        vm.expectRevert("Address has already voted in this battle");
        battleVoting.castVote(BATTLE_ID, participant2);
    }

    function testCannotVoteAfterEndTime() public {
        // Create battle with very short duration
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            1 seconds
        );

        // Wait for voting to end
        vm.warp(block.timestamp + 2 seconds);

        // Try to vote - should fail
        vm.prank(voter1);
        vm.expectRevert("Voting period has ended");
        battleVoting.castVote(BATTLE_ID, participant1);
    }

    function testOnlyCreatorCanCompleteBattle() public {
        // Create battle
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            1 hours
        );

        // Try to complete battle as non-creator - should fail
        vm.prank(voter1);
        vm.expectRevert("Only battle creator can perform this action");
        battleVoting.completeBattle(BATTLE_ID);
    }

    function testOnlyCreatorCanExtendVoting() public {
        // Create battle
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            1 hours
        );

        // Try to extend voting as non-creator - should fail
        vm.prank(voter1);
        vm.expectRevert("Only battle creator can perform this action");
        battleVoting.extendVoting(BATTLE_ID, 1 hours);
    }

    function testGetVotingTimeRemaining() public {
        // Create battle
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            1 hours
        );

        // Check time remaining
        uint256 timeRemaining = battleVoting.getVotingTimeRemaining(BATTLE_ID);
        assertTrue(timeRemaining > 0);
        assertTrue(timeRemaining <= 1 hours);

        // Warp time forward
        vm.warp(block.timestamp + 30 minutes);
        timeRemaining = battleVoting.getVotingTimeRemaining(BATTLE_ID);
        assertTrue(timeRemaining > 0);
        assertTrue(timeRemaining <= 30 minutes);
    }

    function testIsVotingActive() public {
        // Create battle
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            1 hours
        );

        // Voting should be active
        assertTrue(battleVoting.isVotingActive(BATTLE_ID));

        // Warp past end time
        vm.warp(block.timestamp + 2 hours);
        assertFalse(battleVoting.isVotingActive(BATTLE_ID));
    }

    // Feature 9: Test auto-complete battle functionality
    function testAutoCompleteBattle() public {
        // Create battle with short voting duration
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            2 // 2 seconds voting duration
        );

        // Cast some votes
        vm.prank(voter1);
        battleVoting.castVote(BATTLE_ID, participant1);
        
        vm.prank(voter2);
        battleVoting.castVote(BATTLE_ID, participant2);

        // Fast forward past voting end time
        vm.warp(block.timestamp + 3);

        // Anyone should be able to auto-complete the battle
        vm.prank(voter1);
        battleVoting.autoCompleteBattle(BATTLE_ID);

        // Check that battle is completed
        BattleVoting.Battle memory battle = battleVoting.getBattle(BATTLE_ID);
        
        assertEq(battle.battleId, BATTLE_ID);
        assertEq(battle.totalVotes, 2);
        assertEq(battle.participant1Votes, 1);
        assertEq(battle.participant2Votes, 1);
        assertFalse(battle.isActive);
        // Winner should be determined by tie-break logic (block timestamp % 2)
        assertTrue(battle.winner == participant1 || battle.winner == participant2);
    }

    // Feature 9: Test canAutoComplete function
    function testCanAutoComplete() public {
        // Create battle with short voting duration
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            2 // 2 seconds voting duration
        );

        // Initially should not be able to auto-complete
        (bool canAutoComplete, uint256 timeRemaining) = battleVoting.canAutoComplete(BATTLE_ID);
        assertFalse(canAutoComplete);
        assertTrue(timeRemaining > 0);

        // Fast forward past voting end time
        vm.warp(block.timestamp + 3);

        // Now should be able to auto-complete
        (canAutoComplete, timeRemaining) = battleVoting.canAutoComplete(BATTLE_ID);
        assertTrue(canAutoComplete);
        assertEq(timeRemaining, 0);
    }

    // Feature 9: Test getWinnerInfo function
    function testGetWinnerInfo() public {
        // Create and complete battle
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            2 // Short duration
        );

        // Cast votes
        vm.prank(voter1);
        battleVoting.castVote(BATTLE_ID, participant1);
        
        vm.prank(voter2);
        battleVoting.castVote(BATTLE_ID, participant1);

        // Fast forward past voting end time
        vm.warp(block.timestamp + 3);

        // Complete battle
        vm.prank(creator);
        battleVoting.completeBattle(BATTLE_ID);

        // Get winner info
        (address winner, uint256 p1Votes, uint256 p2Votes, bool isCompleted) = battleVoting.getWinnerInfo(BATTLE_ID);
        
        assertEq(winner, participant1);
        assertEq(p1Votes, 2);
        assertEq(p2Votes, 0);
        assertTrue(isCompleted);
    }

    // Feature 9: Test tie-break logic
    function testTieBreakLogic() public {
        // Create battle
        vm.prank(creator);
        battleVoting.createBattle(
            BATTLE_ID,
            CONCEPT,
            participant1,
            participant2,
            PROMPT1,
            PROMPT2,
            IMAGE_URL1,
            IMAGE_URL2,
            2 // Short duration
        );

        // Cast equal votes
        vm.prank(voter1);
        battleVoting.castVote(BATTLE_ID, participant1);
        
        vm.prank(voter2);
        battleVoting.castVote(BATTLE_ID, participant2);

        // Fast forward past voting end time
        vm.warp(block.timestamp + 3);

        // Complete battle
        vm.prank(creator);
        battleVoting.completeBattle(BATTLE_ID);

        // Check that winner is determined by tie-break
        (address winner, , , bool isCompleted) = battleVoting.getWinnerInfo(BATTLE_ID);
        assertTrue(isCompleted);
        assertTrue(winner == participant1 || winner == participant2);
    }
}
