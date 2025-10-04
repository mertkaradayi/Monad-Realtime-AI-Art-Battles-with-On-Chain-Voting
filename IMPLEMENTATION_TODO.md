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

### **Feature 6: Image Display & Voting QR Generation** 🚧 **NEXT TO IMPLEMENT**
- [ ] Show both generated images side by side (LARGE images - 600x600px minimum)
- [ ] Display which participant created which image (LARGE labels)
- [ ] Generate VOTING QR code for audience (40+ people)
- [ ] Show battle concept and "Voting Phase" status (LARGE status banner)
- [ ] **Demo UI**: Split-screen with large images, clear participant labels, battle concept, and VOTING QR code
- [ ] **Test**: Can see both images clearly, battle concept is visible, voting QR is generated

#### **Host Dashboard Enhancements (Feature 6)**
- [ ] Present both images side-by-side with large labels
- [ ] Generate and display Voting QR with copy link button
- [ ] "Start Voting" control to transition to voting phase
- [ ] Optional blur/hide images toggle until reveal
- [ ] Voting phase countdown timer

### **Feature 7: Voting Interface**
- [ ] Audience scans VOTING QR code to access voting interface
- [ ] Connect wallet (Privy) to vote
- [ ] Show voting buttons for each image (LARGE, prominent buttons)
- [ ] Allow users to cast votes (1 per wallet per battle)
- [ ] Store votes in database
- [ ] **Demo UI**: Large voting buttons under each image with clear labels and "Scan QR to Vote" instruction
- [ ] **Test**: Can vote, vote is recorded, multiple people can vote

#### **Host Dashboard Enhancements (Feature 7)**
- [ ] Show live incoming votes per participant (aggregated)
- [ ] Display active voters/connected wallets count
- [ ] "End Voting" control to close voting phase
- [ ] Surface duplicate-vote rejections (1/wallet) in logs panel

### **Feature 8: Real-time Vote Counting**
- [ ] Show live vote counts (LARGE, animated counters)
- [ ] Update counts in real-time
- [ ] **Demo UI**: Prominent vote counters with animations and sound effects
- [ ] **Test**: Vote counts update immediately

#### **Host Dashboard Enhancements (Feature 8)**
- [ ] Large, animated counters for each participant
- [ ] Optional sound toggle for vote events
- [ ] Simple trend graph (optional) for audience engagement

### **Feature 9: Winner Determination**
- [ ] When voting ends, calculate winner
- [ ] Show winner announcement (LARGE, dramatic winner reveal)
- [ ] **Demo UI**: Full-screen winner celebration with confetti/animations
- [ ] **Test**: Winner is determined correctly

#### **Host Dashboard Enhancements (Feature 9)**
- [ ] "Reveal Winner" control with dramatic animation trigger
- [ ] Show final tallies and margin of victory
- [ ] Tie-break workflow (e.g., quick runoff or host tiebreak)
- [ ] "Proceed to Mint" button

### **Feature 10: NFT Minting**
- [ ] Mint winner's image as NFT on Monad
- [ ] Store NFT metadata
- [ ] Show NFT link/transaction (LARGE transaction hash display)
- [ ] **Demo UI**: Prominent NFT minting status with blockchain transaction details
- [ ] **Test**: NFT is minted successfully

#### **Host Dashboard Enhancements (Feature 10)**
- [ ] Mint progress indicator with transaction hash and explorer link
- [ ] Retry on failure with surfaced error details
- [ ] Share QR/link to view minted NFT

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

### **Voting QR Code (Feature 6)**
- **Purpose**: For audience to vote (40+ people)
- **When Generated**: After images are generated
- **Who Uses**: Anyone who wants to vote
- **Display**: Alongside images with "Scan QR to Vote" instruction

### **QR Code Flow**
1. **Battle Creation** → Generate Joining QR
2. **First 2 Users** → Scan Joining QR → Become Participants
3. **Images Generated** → Generate Voting QR
4. **40+ Audience** → Scan Voting QR → Vote

## 🎬 **HACKATHON DEMO REQUIREMENTS**

### **Big Screen Optimization**
- **QR Codes**: Minimum 400x400px for easy scanning from distance
- **Images**: Minimum 600x600px for clear visibility
- **Text**: Large, bold fonts (minimum 24px for body text, 48px+ for headings)
- **Buttons**: Large, prominent buttons (minimum 60px height)
- **Status Indicators**: Large, clear status banners
- **Vote Counters**: Large, animated counters with sound effects
- **Winner Reveal**: Full-screen celebration with animations

### **Demo Flow Optimization**
- **Full-screen modes** for key moments (QR display, image voting, winner reveal)
- **Clear visual hierarchy** for audience understanding
- **Smooth transitions** between battle phases
- **Real-time updates** with visual feedback
- **Audience engagement** through live voting and reactions

---

## 🚀 **CURRENT STATUS**

**Next Feature to Implement**: Feature 5 - Image Generation (fal.ai)

**Implementation Priority**: 
1. **Image Generation Service** - Integrate fal.ai for image generation
2. **Generation Status UI** - Show "Generating images..." with progress indicators
3. **Image Storage** - Store generated image URLs in database
4. **Host Dashboard Integration** - Show generation progress in host dashboard

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
