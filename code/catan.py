import pygame
import random

from drawBoard import drawGame
from dice import rollDice
from selectHouses import selectHouse
from playerInitialSetup import playerTurn

pygame.init()

#screen setup
display_info = pygame.display.Info()
screen_width = display_info.current_w - 100
screen_height = display_info.current_h - 100
screen = pygame.display.set_mode((screen_width, screen_height))
center_x = screen_width // 2
center_y = screen_height // 2
pygame.display.set_caption("Catan")

#Randomize resource tiles
resourceTiles = [(252, 136, 3), (252, 136, 3), (252, 136, 3), (181, 177, 172), (181, 177, 172), (181, 177, 172), (209, 206, 151),
                 (34, 125, 76), (34, 125, 76), (34, 125, 76), (34, 125, 76), (55, 222, 86), (55, 222, 86), (55, 222, 86),
                 (55, 222, 86), (219, 219, 31), (219, 219, 31), (219, 219, 31), (219, 219, 31)]
random.shuffle(resourceTiles)
#List of resource tokens for each tile. Randomly insert the desert token into the array
resourceTokens = [8, 3, 6, 2, 5, 10, 8, 4, 11, 12, 9, 10, 5, 4, 9, 3, 6, 11]
# Find the index of the desert tile color
desert_tile = resourceTiles.index((209, 206, 151))
# Insert the desert token (0) at the same index
resourceTokens.insert(desert_tile, '')
housePlacements = {
    1: 0, 2: 0, 3: 0, 4: 0
}

#font to write text in pygame
pygame.font.init()
my_font = pygame.font.SysFont('Comic Sans MS', 20)

#player trackers
current_player = 1
number_of_players = 4
player1Resources = []
player2Resources = []
player3Resources = []
player4Resources = []

#dice
dice_rect = pygame.Rect(center_x + 300, center_y + 250, 100, 100)
dice_rolled = False

#end turn button
dice_rect_end_turn = pygame.Rect(center_x + 430, center_y + 270, 75, 50)
ended_turn = False

#house options coordinates
houseOptions = [
    (660, 220), (610, 250), (560, 220), (560, 160), (610, 130),
    (770, 220), (720, 250), (670, 160), (720, 130),
    (880, 220), (830, 250), (780, 160), (830, 130), (880, 160),
    (940, 320), (880, 350), (940, 260),
    (990, 410), (940, 440), (890, 410), (990, 350),
    (940, 510), (880, 540), (830, 510),
    (880, 600), (830, 630),
    (770, 600), (720, 630),
    (660, 600), (610, 630), (560, 600), (560, 540),
    (500, 510), 
    (500, 440), (440, 410), (450, 350),
    (610, 320), (550, 350), (500, 320), (500, 260),
    (720, 320), (660, 350),
    (830, 320), (770, 350),
    (830, 440),
    (770, 540),
    (720, 510), (660, 540), (610, 510),
    (660, 410), (610, 440), (560, 410),
    (770, 410), (720, 440)
]
house_to_tile_map = {
    (610, 130): [0], (720, 130): [1], (830, 130): [2],
    (560, 160): [0], (670, 160): [0,1], (780, 160): [1,2], (880, 160): [2],
    (560, 220): [0, 11], (660, 220): [0,1,12], (770, 220): [1,2,13], (880, 220): [2,3],
    (500, 260): [11], (610, 250): [0,11,12], (720, 250): [1,12,13], (830, 250): [2,3,13], (940, 260): [3],
    (500, 320): [10,11], (610, 320): [11,12,17], (720, 320): [12,13,18], (830, 320): [3,13,14], (940, 320): [3,4],
    (450, 350): [10], (550, 350): [10,11,17], (660, 350): [12,17,18], (770, 350): [13,14,18], (880, 350): [3,4,14], (990, 350): [4],
    (440, 410): [10], (560, 410): [9,10,17], (660, 410): [16,17,18], (770, 410): [14,15,18], (890, 410): [4,5,14], (990, 410): [4],
    (500, 440): [9,10], (610, 440): [9,16,17], (720, 440): [15,16,18], (830, 440): [5,14,15], (940, 440): [4,5],
    (500, 510): [9], (610, 510): [8,9,16], (720, 510): [7,15,16], (830, 510): [5,6,15], (940, 510): [5],
    (560, 540): [8,9], (660, 540): [7,8,16], (770, 540): [6,7,15], (880, 540): [5,6],
    (560, 600): [8], (660, 600): [7,8], (770, 600): [6,7], (880, 600): [6],
    (610, 630): [8], (720, 630): [7], (830, 630): [6],
}


houseOption_choices = []
housesPlayer1 = []
housesPlayer2 = []
housesPlayer3 = []
housesPlayer4 = []
choosing_direction = 1
house_options_drawn = False
selectedHouse = None
endOfChoosingHouses = False

#get every house option and store it
for x, y in houseOptions:
    houseOption_choices.append({'position': (x, y)})

#pygame is running
running = True
drawGame(housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4,
         resourceTiles, resourceTokens,
         dice_rect, dice_rect_end_turn, screen, my_font)
while running:
    for event in pygame.event.get():
        #if the player quits/exits
        if event.type == pygame.QUIT:
            running = False
        #choosing houses loop
        if not endOfChoosingHouses:
            if current_player == 1:
                ended, selectedHouse, house_options_drawn = playerTurn(
                    event, 1, (255, 0, 0), houseOption_choices, selectedHouse, house_options_drawn,
                    housesPlayer1, housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4,
                    resourceTiles, resourceTokens,
                    dice_rect, dice_rect_end_turn, screen, my_font, player1Resources, house_to_tile_map,
                    housePlacements[1])
                if ended:
                    selectedHouse = None
                    house_options_drawn = False
                    if choosing_direction == 1:
                        current_player = 2
                        housePlacements[1] += 1
                    else:
                        endOfChoosingHouses = True

            elif current_player == 2:
                ended, selectedHouse, house_options_drawn = playerTurn(
                    event, 2, (0, 255, 0), houseOption_choices, selectedHouse, house_options_drawn,
                    housesPlayer2, housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4,
                    resourceTiles, resourceTokens,
                    dice_rect, dice_rect_end_turn, screen, my_font, player2Resources, house_to_tile_map,
                    housePlacements[2])
                if ended:
                    selectedHouse = None
                    house_options_drawn = False
                    current_player = 3 
                    if choosing_direction == 1:
                        housePlacements[2] += 1
                    else:
                        current_player = 1

            elif current_player == 3:
                ended, selectedHouse, house_options_drawn = playerTurn(
                    event, 3, (0, 0, 255), houseOption_choices, selectedHouse, house_options_drawn,
                    housesPlayer3, housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4,
                    resourceTiles, resourceTokens,
                    dice_rect, dice_rect_end_turn, screen, my_font, player3Resources, house_to_tile_map,
                    housePlacements[3])
                if ended:
                    selectedHouse = None
                    house_options_drawn = False
                    current_player = 4 
                    if choosing_direction == 1:
                        housePlacements[3] += 1
                    else: current_player = 2

            elif current_player == 4:
                ended, selectedHouse, house_options_drawn = playerTurn(
                    event, 4, (0, 255, 255), houseOption_choices, selectedHouse, house_options_drawn,
                    housesPlayer4, housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4,
                    resourceTiles, resourceTokens,
                    dice_rect, dice_rect_end_turn, screen, my_font, player4Resources, house_to_tile_map,
                    housePlacements[4])
                if ended:
                    selectedHouse = None
                    house_options_drawn = False
                    if choosing_direction == 1:
                        choosing_direction = -1  # Start going backwards
                        housePlacements[4] += 1
                    else:
                        current_player = 3  # Go to player 3 next

            #for future
            #dice_rolled = rollDice(event, dice_rect, dice_rolled, screen, my_font)
pygame.quit()
