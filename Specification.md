## Software Requirements Specification for the Web-based Catan game

## Introduction

### Purpose
The purpose of this application is to allow me to host games of Catan for free, which allows anyone invited (via link) to join and play. The games can be fully customised to allow different variations to be played easily. 

The key goals of the new system are:
- Easy to join via link and smooth gameplay.
- Free to play.
- Allows full customization of games to mimic expansions.

### Scope
This application will be usable by anyone who gets an invite to join. The application will handle:
- The number of users trying to play a game.
- Inputs from players during their turn.
- Customization of Catan games.

### Definitions, Acronyms, and Abbreviations
- **Technical words**: definition

## Overview
The web-based Catan game is a web-based platform designed to allow my friends and me to play fully customizable games of Catan easily and without paying money.

### System Features:
1. **Game Lobby**: Keeps track of all users who join the application. Allow users to customize the game to their wants. Keeps track of when all users "ready up" and starts the game.
2. **Game Screen**: The actual game of Catan that the users will play. 
3. **Win Screen**: The ending screen after a player wins a game. Allows users to click to play again.

The system will be designed with scalability in mind, allowing for the addition of new customizable options easily.

The following sections detail the specific use cases that the system will support, describing how students and staff will interact with the system during typical operations.

## Use Cases

### Use Case 1.1: User Log-In
- **Actors**: Friends/Anyone who is invited
- **Overview**: Users are displayed in the lobby, and have a status for when they are ready to play.

**Typical Course of Events**:
1. User appears in the list of players
2. The user might change game options to what they want.
3. The user will hit "ready" when they want to play.

### Use Case 1.2: Game starts
- **Actors**: User
- **Overview**: The game of Catan will start with the correct customized options.

**Typical Course of Events**:
1. Run Use Case 1.1, *User Log-In*.
2. The game will start up with the options the users selected.
3. Users will begin playing the game of Catan. All user inputs will be recorded each turn.
4. The game will continue until there is a winner.

**Alternative Courses**:
- Any step: User leaves the game.
  1. User leaves the game.
  2. The user's turn will be skipped and voided to avoid any glitches.
  3. Potential: User can rejoin and continue playing. There can be a time limit for the user to rejoin.

### Use Case 1.3: Ending Screen
- **Actors**: Users
- **Overview**: A user wins the game.

**Typical Course of Events**:
1. User wins the game.
2. The win screen appears, showing the results.
3. Users have the option to start a new game.
4. Send user to game lobby.
5. Run Use Case 1.1, *User Log-In*.
