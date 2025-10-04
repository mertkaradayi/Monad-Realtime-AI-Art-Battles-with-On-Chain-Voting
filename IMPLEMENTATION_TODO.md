# 🎯 **REALTIME AI ART BATTLES - IMPLEMENTATION TODO**

## 📋 **FEATURE-BY-FEATURE IMPLEMENTATION ORDER**

### **Feature 1: Battle Creation & Joining QR Code** ✅ **COMPLETED**
- [x] User clicks "Create Battle" button (LARGE, prominent button for demo)
- [x] LLM generates unique battle concept/theme (e.g., "Elephant is on its foot in a ball...")
- [x] Generate JOINING QR code for participants (first 2 users)
- [x] Display joining QR code (LARGE QR code - 400x400px minimum for big screen)
- [x] **Demo UI**: Full-screen QR display with battle concept and "Scan to Join Battle" text
- [x] **Test**: Can create battle, see joining QR code, see battle concept
- [x] **QR Code Testing**: QR code successfully navigates to join page on mobile

### **Feature 2: Battle Joining (First Participant)** ✅ **COMPLETED**
- [x] First user scans JOINING QR code
- [x] Connect wallet (Privy)
- [x] **Bug Fixed**: Wallet connection state now updates properly (no refresh needed)
- [x] Automatically becomes Participant 1 (first to join) - **IMPLEMENTED**
- [x] Show battle concept and "Waiting for Participant 2" status (LARGE, clear status text)
- [x] **Demo UI**: Prominent waiting screen with battle concept and "1/2 participants joined"
- [x] **Test**: Can join battle, see waiting status, see battle concept

### **Feature 3: Battle Joining (Second Participant)** ✅ **COMPLETED**
- [x] Second user scans JOINING QR code
- [x] Connect wallet (Privy)
- [x] Automatically becomes Participant 2 (second to join)
- [x] Battle status changes to "Active" (LARGE status indicator)
- [x] Both participants see each other and battle concept (LARGE participant avatars/names)
- [x] **Demo UI**: Split-screen showing both participants and battle concept clearly
- [x] **Test**: Second user can join, battle becomes active, both see battle concept

### **Feature 3.5: Battle Host Dashboard** ✅ **COMPLETED**
- [x] Real-time participant tracking for battle creators
- [x] Live polling system (every 3 seconds) to check for new participants
- [x] Visual participant status display with wallet addresses
- [x] Toast notifications when participants join ("👤 Participant 1 joined!", "👤 Participant 2 joined!")
- [x] Battle status summary with participant counter (X/2 participants joined)
- [x] **Demo UI**: Host dashboard with large participant cards and live updates indicator
- [x] **QR Code Persistence**: Fixed QR code disappearing issue during polling
- [x] **Test**: Host can see participants join in real-time, QR code stays visible

### **Feature 4: Prompt Submission** ✅ **COMPLETED**
- [x] **Database Schema**: Add prompt fields to battles table (participant1_prompt, participant2_prompt)
- [x] **Backend API**: Create prompt submission endpoint (`POST /api/battles/:id/submit-prompt`)
- [x] **Prompt Validation**: Ensure users can only submit prompts for their own participant slot
- [x] **UI for Participants**: Show battle concept as fixed prompt starter (e.g., "Elephant is on its foot in a ball...")
- [x] **Input Fields**: Large textarea for participants to complete the prompt (LARGE input fields)
- [x] **Concept Protection**: Users cannot modify the battle concept, only complete it
- [x] **Submission Logic**: Store full prompts in database (concept + user completion)
- [x] **Confirmation**: Show "Prompt submitted" confirmation (LARGE confirmation text)
- [x] **Status Updates**: Update battle status to "prompts_submitted" when both prompts are in
- [x] **Demo UI**: Side-by-side prompt submission with fixed concept and completion fields
- [x] **Test**: Can submit prompts, see confirmation, concept is fixed, both participants can submit

#### **Host Dashboard Enhancements (Feature 4)** ✅ **COMPLETED**
- [x] Show per-participant prompt status (Pending/Submitted)
- [x] Display prompt previews (truncated) with hide/reveal until both submitted
- [x] Provide "Start Image Generation" control when both prompts are submitted (or auto-advance)
- [x] Add submission countdown/timer visible to audience (50-second timer)
- [x] Toast notifications when each prompt is submitted

### **Feature 5: Image Generation (fal.ai)** ✅ **COMPLETED**
- [x] When both prompts submitted, trigger image generation
- [x] Show "Generating images..." status (LARGE loading animation)
- [x] Generate images using fal.ai with full prompts (concept + user completion)
- [x] Store image URLs in database
- [x] **Demo UI**: Full-screen loading with progress indicators and battle concept display
- [x] **Test**: Images generate successfully, URLs stored, concept is preserved

#### **Host Dashboard Enhancements (Feature 5)** ✅ **COMPLETED**
- [x] Show per-participant generation status (Queued → Generating → Complete)
- [x] Visual progress indicators/spinners for each image job
- [x] Error state with retry control per participant
- [x] Timestamps for generation start/finish

### **Feature 6: On-Chain Voting Contract Deployment** 🚧 **NEXT TO IMPLEMENT**
- [x] Show both generated images side by side (LARGE images - 600x600px minimum) ✅ **COMPLETED - Host Dashboard**
- [x] Display which participant created which image (LARGE labels) ✅ **COMPLETED - Host Dashboard**
- [ ] **Smart Contract Development**: Create BattleVoting contract for Monad testnet
- [ ] **Contract Deployment**: Deploy voting contract when images are ready
- [ ] **QR Code Generation**: Generate voting QR with contract address and battle parameters
- [ ] **Monad Integration**: Connect to Monad testnet RPC endpoints
- [ ] Show battle concept and "On-Chain Voting Phase" status (LARGE status banner)
- [ ] **Demo UI**: Split-screen with large images, clear participant labels, battle concept, and ON-CHAIN VOTING QR code
- [ ] **Test**: Contract deploys successfully, QR code contains valid contract address, Monad connection works

#### **Host Dashboard Enhancements (Feature 6)**
- [ ] Present both images side-by-side with large labels
- [ ] Generate and display On-Chain Voting QR with contract address
- [ ] "Deploy Voting Contract" control to start on-chain voting phase
- [ ] Contract deployment status and transaction hash display
- [ ] 60-second voting countdown timer
- [ ] Real-time contract state monitoring

### **Feature 7: On-Chain Voting Interface**
- [ ] **Wallet Connection**: Connect to Monad testnet wallet via Privy
- [ ] **Contract Interaction**: Direct smart contract voting calls
- [ ] **Vote Validation**: Ensure 1 vote per wallet per battle (on-chain enforcement)
- [ ] **Transaction Handling**: Handle 100+ concurrent voting transactions
- [ ] **Real-time Updates**: Poll contract state for live vote counts
- [ ] **Gas Optimization**: Efficient contract calls for high throughput
- [ ] **Demo UI**: Large voting buttons with transaction status and gas estimation
- [ ] **Test**: Can vote on-chain, vote is recorded in smart contract, multiple people can vote simultaneously

#### **Host Dashboard Enhancements (Feature 7)**
- [ ] Show live on-chain vote counts per participant (from contract)
- [ ] Display active voters/connected wallets count
- [ ] Real-time transaction monitoring and confirmation status
- [ ] Gas price optimization and transaction batching
- [ ] Contract event listening for vote events
- [ ] "End Voting" control to close 60-second voting window

### **Feature 8: On-Chain Vote Counting & Real-time Updates**
- [ ] **Contract State Polling**: Real-time vote count updates from smart contract
- [ ] **Event Listening**: Listen for VoteCast events from contract
- [ ] **Performance Optimization**: Handle 100+ votes in 60 seconds
- [ ] **Transaction Status**: Show pending/confirmed states for all votes
- [ ] **Demo UI**: Prominent on-chain vote counters with blockchain transaction animations
- [ ] **Test**: Vote counts update in real-time from contract, handles high transaction volume

#### **Host Dashboard Enhancements (Feature 8)**
- [ ] Large, animated counters showing on-chain vote counts
- [ ] Real-time transaction feed with wallet addresses
- [ ] Gas usage monitoring and optimization suggestions
- [ ] Contract interaction logs and error handling
- [ ] Voting participation rate and engagement metrics

### **Feature 9: On-Chain Winner Determination**
- [ ] **60-Second Timer**: Enforce voting window with block timestamp validation
- [ ] **On-Chain Calculation**: Determine winner directly from smart contract
- [ ] **Automatic Trigger**: Auto-trigger winner announcement when voting ends
- [ ] **Blockchain Verification**: All results publicly verifiable on Monad testnet
- [ ] **Demo UI**: Full-screen winner celebration with on-chain verification display
- [ ] **Test**: Winner determined correctly from on-chain data, results are verifiable

#### **Host Dashboard Enhancements (Feature 9)**
- [ ] "Reveal On-Chain Winner" with blockchain verification
- [ ] Show final tallies with contract transaction hashes
- [ ] Tie-break workflow (on-chain random selection or host override)
- [ ] "Proceed to NFT Minting" button with winner verification
- [ ] Contract state finalization and result locking

### **Feature 10: On-Chain NFT Minting**
- [ ] **Smart Contract Integration**: Mint winner's image as NFT on Monad testnet
- [ ] **Metadata Storage**: Store NFT metadata on-chain with IPFS integration
- [ ] **Winner Verification**: Verify winner from on-chain voting results
- [ ] **Transaction Display**: Show NFT minting transaction hash and explorer link
- [ ] **Demo UI**: Prominent NFT minting status with blockchain transaction details
- [ ] **Test**: NFT is minted successfully on Monad testnet, metadata is accessible

#### **Host Dashboard Enhancements (Feature 10)**
- [ ] On-chain minting progress with transaction hash and Monad explorer link
- [ ] Retry on failure with surfaced error details and gas optimization
- [ ] Share QR/link to view minted NFT on Monad testnet
- [ ] NFT metadata verification and IPFS pinning status

### **Feature 11: Battle Results**
- [ ] Show complete battle results (LARGE summary display)
- [ ] Display minted NFT (LARGE NFT preview)
- [ ] Show battle history
- [ ] **Demo UI**: Full-screen results with large NFT display and battle summary
- [ ] **Test**: Can view results and NFT

#### **Host Dashboard Enhancements (Feature 11)**
- [ ] Present final summary view (concept, prompts, images, votes, winner, NFT)
- [ ] Share results link/QR and download assets
- [ ] "Start New Battle" control for quick reset

---

## 🧪 **TESTING STRATEGY**

For each feature:
1. **Implement the feature**
2. **Test it manually** with real users
3. **Verify it works** in the actual flow
4. **Move to next feature** only after current one works

---

## 📝 **NOTES**

- Start with Feature 1 and work through sequentially
- Test each feature thoroughly before moving to the next
- Keep the current tech stack: Next.js + TypeScript + Supabase + Privy + shadcn/ui
- Use fal.ai for image generation
- Use Monad for blockchain operations (voting + NFT minting)

## 🎨 **BATTLE CONCEPT SYSTEM**

### **LLM-Generated Battle Concepts**
- **Purpose**: Each battle has a unique theme/concept generated by LLM
- **Format**: "Elephant is on its foot in a ball..." (incomplete sentence)
- **Usage**: Users must complete the concept, cannot modify the starter
- **Examples**: 
  - "A robot dancing in the rain..."
  - "A cat wearing a space helmet..."
  - "A tree growing upside down..."
  - "A car made of cheese..."

### **Concept Generation Rules**
- **Creativity**: Generate unique, interesting concepts for each battle
- **Completeness**: Always end with "..." to indicate user completion
- **Variety**: Mix different themes (animals, objects, scenarios, emotions)
- **Length**: Keep starter concise (10-15 words max)
- **Imagination**: Encourage creative and unexpected combinations

## 🔄 **TWO QR CODES SYSTEM**

### **Joining QR Code (Feature 1)**
- **Purpose**: For participants to join battle (first 2 users)
- **When Generated**: When battle is created
- **Who Uses**: First 2 users who scan become Participant 1 & 2
- **Display**: Full-screen with battle concept and "Scan to Join Battle"

### **On-Chain Voting QR Code (Feature 6)**
- **Purpose**: For audience to vote on-chain (100+ people)
- **When Generated**: After images are generated and voting contract is deployed
- **Who Uses**: Anyone who wants to vote on Monad testnet
- **Content**: `monad://voting-contract-address?battleId=123&participant1=0x...&participant2=0x...`
- **Display**: Alongside images with "Scan QR to Vote On-Chain" instruction

### **QR Code Flow**
1. **Battle Creation** → Generate Joining QR
2. **First 2 Users** → Scan Joining QR → Become Participants
3. **Images Generated** → Deploy Voting Contract → Generate On-Chain Voting QR
4. **100+ Audience** → Scan Voting QR → Connect Wallet → Vote On-Chain

## ⛓️ **ON-CHAIN VOTING SYSTEM REQUIREMENTS**

### **Smart Contract Architecture**
```solidity
contract BattleVoting {
    struct Battle {
        uint256 battleId;
        address participant1;
        address participant2;
        uint256 startTime;
        uint256 endTime;
        uint256 participant1Votes;
        uint256 participant2Votes;
        bool votingEnded;
        string participant1Image;
        string participant2Image;
    }
    
    mapping(uint256 => Battle) public battles;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    event VoteCast(uint256 indexed battleId, address indexed voter, uint256 participant);
    event VotingEnded(uint256 indexed battleId, uint256 winner);
    
    function vote(uint256 battleId, uint256 participant) external {
        // Voting logic with time validation and duplicate prevention
    }
    
    function getResults(uint256 battleId) external view returns (uint256, uint256) {
        // Return vote counts
    }
    
    function endVoting(uint256 battleId) external {
        // End voting and determine winner
    }
}
```

### **Technical Stack Requirements**

#### **Smart Contract Development**
- **Solidity**: For contract development
- **Hardhat/Foundry**: For compilation and testing
- **Monad SDK**: For Monad-specific deployment
- **OpenZeppelin**: For secure contract patterns

#### **Frontend Integration**
- **Web3.js/Ethers.js**: For contract interaction
- **Privy**: For Monad wallet connection
- **React Query/SWR**: For real-time contract state polling
- **QR Code Library**: For voting QR generation

#### **Backend Services**
- **Contract Deployment Service**: Deploy voting contracts per battle
- **Monad RPC**: Connect to Monad testnet endpoints
- **Event Listening**: Listen for voting events and results
- **Gas Optimization**: Efficient transaction handling

### **Performance Requirements**
- **Voting Window**: 60 seconds maximum
- **Target Throughput**: 100+ votes in 60 seconds
- **Gas Optimization**: Efficient storage patterns for high throughput
- **Real-time Updates**: Contract state polling every 2-3 seconds
- **Transaction Handling**: Concurrent transaction management

### **Security Considerations**
- **Vote Validation**: 1 vote per wallet per battle (on-chain enforcement)
- **Time Validation**: Block timestamp validation for voting window
- **Access Control**: Only battle participants and voters can interact
- **Gas Limit**: Optimize for reasonable gas costs
- **Event Logging**: Comprehensive event logging for transparency

## 🎬 **HACKATHON DEMO REQUIREMENTS**

### **Big Screen Optimization**
- **QR Codes**: Minimum 400x400px for easy scanning from distance
- **Images**: Minimum 600x600px for clear visibility
- **Text**: Large, bold fonts (minimum 24px for body text, 48px+ for headings)
- **Buttons**: Large, prominent buttons (minimum 60px height)
- **Status Indicators**: Large, clear status banners
- **On-Chain Vote Counters**: Large, animated counters with blockchain transaction animations
- **Winner Reveal**: Full-screen celebration with on-chain verification display

### **Demo Flow Optimization**
- **Full-screen modes** for key moments (QR display, on-chain voting, winner reveal)
- **Clear visual hierarchy** for audience understanding
- **Smooth transitions** between battle phases
- **Real-time blockchain updates** with visual feedback
- **Audience engagement** through live on-chain voting and reactions
- **Blockchain transparency** with transaction hashes and explorer links

### **Monad Hackathon Winning Features**
- **On-Chain Voting**: True blockchain-native voting system
- **High Throughput**: 100+ votes in 60 seconds on Monad testnet
- **Transparency**: All votes and results publicly verifiable
- **Decentralization**: No central authority controlling votes
- **Real-time Performance**: Live blockchain state updates
- **Gas Optimization**: Efficient smart contract design
- **NFT Integration**: Winner NFT minting on Monad testnet

---

## 🚀 **CURRENT STATUS**

**Next Feature to Implement**: Feature 6 - On-Chain Voting Contract Deployment

**Implementation Priority**: 
1. **Smart Contract Development** - Create BattleVoting contract for Monad testnet
2. **Monad Integration** - Set up Monad testnet RPC and deployment tools
3. **Contract Deployment Service** - Deploy voting contracts per battle
4. **QR Code Generation** - Generate voting QR with contract address
5. **On-Chain Voting Interface** - Build frontend for direct contract interaction

**Last Updated**: January 3, 2025

**Recent Updates**:
- ✅ **Feature 1 COMPLETED**: Battle Creation & QR Code working perfectly
- ✅ **Feature 2 COMPLETED**: First participant auto-joining and waiting screen
- ✅ **Feature 3 COMPLETED**: Second participant joining and active battle display
- ✅ **Feature 3.5 COMPLETED**: Battle Host Dashboard with real-time participant tracking
- ✅ **Feature 4 COMPLETED**: Prompt submission with 50-second timer and enhanced host dashboard
- ✅ **QR Code Testing**: Successfully tested on mobile device
- 🐛 **Bug Fixed**: Wallet connection state update issue resolved
- 🐛 **Bug Fixed**: Atomic UPDATE query logic fixed for battle joining
- 🐛 **Bug Fixed**: QR code disappearing issue during polling resolved
- ✅ **Auto-Join**: Users automatically become participants when scanning QR code
- ✅ **Demo UI**: Large waiting screen with battle concept and participant status
- ✅ **Split-Screen UI**: Active battle display with both participants and battle concept
- ✅ **Real-time Updates**: Polling system for automatic status updates
- ✅ **Host Dashboard**: Real-time participant tracking with live notifications
- ✅ **Race Condition Fix**: Atomic database operations prevent duplicate participants
- ✅ **Comprehensive Testing**: Full test suite for Features 1-3 with manual testing guide
- ✅ **QR Code Test Fix**: Fixed QR generation test to properly validate data URL format
- 🗑️ **Database Flush**: Successfully flushed database for clean testing environment
- ⏰ **Timer Enhancement**: Reduced prompt submission timer from 5 minutes to 50 seconds
- 🎯 **Host Dashboard**: Enhanced visibility with prominent countdown and prompt status indicators

---

## 🎯 **FEATURE 4 IMPLEMENTATION PLAN**

### **Step 1: Database Schema Update**
```sql
-- Add prompt fields to battles table
ALTER TABLE battles ADD COLUMN participant1_prompt TEXT;
ALTER TABLE battles ADD COLUMN participant2_prompt TEXT;
ALTER TABLE battles ADD COLUMN prompts_submitted_at TIMESTAMPTZ;
```

### **Step 2: Backend API Development**
- **Endpoint**: `POST /api/battles/:id/submit-prompt`
- **Validation**: Ensure user is a participant in the battle
- **Logic**: Update the appropriate participant prompt field
- **Status Update**: Change battle status to "prompts_submitted" when both prompts are in

### **Step 3: Frontend UI Development**
- **Participant View**: Show prompt submission interface when battle is active
- **Fixed Concept**: Display battle concept as uneditable starter text
- **Input Field**: Large textarea for prompt completion
- **Submit Button**: Submit prompt and show confirmation
- **Real-time Updates**: Show when other participant submits their prompt

### **Step 4: Integration Points**
- **Join Page**: Add prompt submission UI after battle becomes active
- **Host Dashboard**: Show prompt submission status
- **Status Flow**: waiting → active → prompts_submitted → (next feature)

### **Step 5: Testing Strategy**
- **Manual Testing**: Create battle, join as both participants, submit prompts
- **Validation Testing**: Ensure users can only submit for their own slot
- **UI Testing**: Verify large, demo-friendly interface
- **Integration Testing**: Test full flow from battle creation to prompt submission
