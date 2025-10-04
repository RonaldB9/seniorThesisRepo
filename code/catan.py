import pygame
import random

from drawBoard import drawGame
from dice import rollDice
from playerInitialSetup import playerTurn

#clock to control usage
clock = pygame.time.Clock()
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
    1: 0, 2: 0, 3: 0, 4: 0 #make dynamic
}

#font to write text in pygame
pygame.font.init()
my_font = pygame.font.SysFont('Comic Sans MS', 20)

#player trackers
current_player = 1
number_of_players = 4 #make dynamic
players = {
    1: {'color': (255, 0, 0), 'houses': [], 'roads': [], 'resources': [], 'placements': 0},
    2: {'color': (0, 255, 0), 'houses': [], 'roads': [], 'resources': [], 'placements': 0},
    3: {'color': (0, 0, 255), 'houses': [], 'roads': [], 'resources': [], 'placements': 0},
    4: {'color': (0, 255, 255), 'houses': [], 'roads': [], 'resources': [], 'placements': 0},
}

player_order = list(players.keys())
current_index = 0

#dice
dice_rect = pygame.Rect(center_x + 300, center_y + 250, 100, 100)
dice_rolled = False

#end turn button
dice_rect_end_turn = pygame.Rect(center_x + 430, center_y + 270, 75, 50)
ended_turn = False

#house options coordinates
houseOptions = [ (610, 130), (720, 130), (830, 130),
    (560, 160), (670, 160), (780, 160), (880, 160),
    (560, 220), (660, 220), (770, 220), (880, 220), 
    (500, 260), (610, 250), (720, 250), (830, 250), (940, 260),
    (500, 320), (610, 320), (720, 320), (830, 320), (940, 320), 
    (450, 350), (550, 350), (660, 350), (770, 350), (880, 350), (990, 350),
    (440, 410), (560, 410), (660, 410), (770, 410), (890, 410), (990, 410), 
    (500, 440), (610, 440), (720, 440), (830, 440), (940, 440),   
    (500, 510), (610, 510), (720, 510), (830, 510), (940, 510), 
    (560, 540), (660, 540), (770, 540), (880, 540),  
    (560, 600), (660, 600), (770, 600), (880, 600), 
    (610, 630), (720, 630), (830, 630)]

#(house coords) : connected tiles
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
roadOption_choices = []
choosing_direction = 1
house_options_drawn = False
selectedHouse = None
endOfChoosingHouses = False

#roads - (coords) [connected houses] [connected roads]
road_segments = {
    #top roads
    ((560, 160), (610, 130)): [ [0,3], [] ],
    ((610, 130), (670, 160)): [ [0,4], [] ], 
    ((670, 160), (720, 130)): [ [1,4], [] ],
    ((720, 130), (780, 160)): [ [1,5], [] ], 
    ((780, 160), (830, 130)): [ [2,5], [] ], 
    ((830, 130), (880, 160)): [ [2,6], [] ],

    #2nd row vertical roads
    ((560, 160), (560, 220)): [ [3,7], [] ], 
    ((670, 160), (670, 220)): [ [4,8], [] ], 
    ((780, 160), (780, 220)): [ [5,9], [] ], 
    ((880, 160), (880, 220)): [ [6,10], [] ],

    #3rd row
    ((500, 250), (560, 220)): [ [7,11], [] ],
    ((560, 220), (620, 250)): [ [7,12], [] ], 
    ((620, 250), (660, 220)): [ [8,12], [] ],
    ((660, 220), (720, 250)): [ [8,13], [] ], 
    ((720, 250), (780, 220)): [ [9,13], [] ], 
    ((780, 220), (830, 250)): [ [9,14], [] ],
    ((830, 250), (880, 220)): [ [10,14], [] ], 
    ((880, 220), (940, 250)): [ [10,15], [] ],
    
    #4th row
    ((500, 250), (500, 320)): [ [11,16], [] ],
    ((610, 250), (610, 320)): [ [12,17], [] ], 
    ((720, 250), (720, 320)): [ [13,18], [] ], 
    ((830, 250), (830, 320)): [ [14,19], [] ],
    ((940, 250), (940, 320)): [ [15,20], [] ],

    #5th row
    ((440, 350), (500, 320)): [ [16,21], [] ],
    ((500, 320), (560, 350)): [ [16,22], [] ], 
    ((560, 350), (620, 320)): [ [17,22], [] ],
    ((620, 320), (660, 350)): [ [17,23], [] ], 
    ((660, 350), (720, 320)): [ [18,23], [] ], 
    ((720, 320), (780, 350)): [ [18,24], [] ],
    ((780, 350), (830, 320)): [ [19,24], [] ], 
    ((830, 320), (880, 350)): [ [19,25], [] ],
    ((880, 350), (940, 320)): [ [20,25], [] ],
    ((940, 320), (990, 350)): [ [20,26], [] ],

    #6th row
    ((440, 350), (440, 420)): [ [21,27], [] ],
    ((550, 350), (550, 420)): [ [22,28], [] ], 
    ((660, 350), (660, 420)): [ [23,29], [] ], 
    ((770, 350), (770, 420)): [ [24,30], [] ],
    ((880, 350), (880, 420)): [ [25,31], [] ],
    ((990, 350), (990, 420)): [ [26,32], [] ],

    #7th row
    ((440, 420), (500, 440)): [ [27,33], [] ],
    ((500, 440), (560, 420)): [ [28,33], [] ], 
    ((560, 420), (620, 440)): [ [28,34], [] ],
    ((620, 440), (660, 420)): [ [29,34], [] ], 
    ((660, 420), (720, 440)): [ [29,35], [] ], 
    ((720, 440), (780, 420)): [ [30,35], [] ],
    ((780, 420), (830, 440)): [ [30,36], [] ], 
    ((830, 440), (880, 420)): [ [31,36], [] ],
    ((880, 420), (940, 440)): [ [31,37], [] ],
    ((940, 440), (990, 420)): [ [32,37], [] ],

    #8th row
    ((500, 440), (500, 510)): [ [33,38], [] ],
    ((610, 440), (610, 510)): [ [34,39], [] ], 
    ((720, 440), (720, 510)): [ [35,40], [] ], 
    ((830, 440), (830, 510)): [ [36,41], [] ],
    ((940, 440), (940, 510)): [ [37,42], [] ],

    #9th row
    ((500, 510), (560, 540)): [ [38,43], [] ],
    ((560, 540), (620, 510)): [ [39,43], [] ], 
    ((620, 510), (660, 540)): [ [39,44], [] ],
    ((660, 540), (720, 510)): [ [40,44], [] ], 
    ((720, 510), (780, 540)): [ [40,45], [] ], 
    ((780, 540), (830, 510)): [ [41,45], [] ],
    ((830, 510), (880, 540)): [ [41,46], [] ], 
    ((880, 540), (940, 510)): [ [42,46], [] ],

    #10th row vertical roads
    ((560, 540), (560, 600)): [ [43,47], [] ], 
    ((670, 540), (670, 600)): [ [44,48], [] ], 
    ((780, 540), (780, 600)): [ [45,49], [] ], 
    ((880, 540), (880, 600)): [ [46,50], [] ],

    #bottom roads
    ((560, 600), (610, 630)): [ [47,51], [] ],
    ((610, 630), (670, 600)): [ [48,51], [] ], 
    ((670, 600), (720, 630)): [ [48,52], [] ],
    ((720, 630), (780, 600)): [ [49,52], [] ], 
    ((780, 600), (830, 630)): [ [49,53], [] ], 
    ((830, 630), (880, 600)): [ [50,53], [] ]
}

#get every house option and store it
for x, y in houseOptions:
    houseOption_choices.append({'position': (x, y)})

roadOption_choices = list(road_segments.keys())
roadsChosen = []

#pygame is running
running = True
#draw initial game
drawGame(players[1]['houses'], players[2]['houses'], players[3]['houses'], players[4]['houses'], resourceTiles, 
         resourceTokens, dice_rect, dice_rect_end_turn, screen, my_font, road_segments, players)
while running:
    for event in pygame.event.get():
        #if the player quits/exits
        if event.type == pygame.QUIT:
            running = False
        #choosing houses loop
        if not endOfChoosingHouses:
            current_player_id = player_order[current_index]
            player_data = players[current_player_id]
            #player chooses house
            ended, selectedHouse, house_options_drawn = playerTurn(
                event, current_player_id, player_data['color'], houseOption_choices, selectedHouse, house_options_drawn,
                player_data['houses'], players[1]['houses'], players[2]['houses'], players[3]['houses'], players[4]['houses'],
                resourceTiles, resourceTokens, dice_rect, dice_rect_end_turn, screen, my_font,
                player_data['resources'], house_to_tile_map, player_data['placements'], road_segments, player_data['roads'], players,
                roadOption_choices, roadsChosen, houseOptions)
            #after player chooses house
            if ended:
                selectedHouse = None
                house_options_drawn = False
                players[current_player_id]['placements'] += 1

                if choosing_direction == 1:
                    current_index += 1
                    if current_index >= len(player_order):
                        choosing_direction = -1
                        current_index = len(player_order) - 1  # Start backward
                else:
                    current_index -= 1
                    if current_index < 0:
                        endOfChoosingHouses = True  # Done choosing houses
    #60 fps
    clock.tick(60)
            #for future
            #dice_rolled = rollDice(event, dice_rect, dice_rolled, screen, my_font)
pygame.quit()

#to do
#make roads connect to each other
#fix coords to be relative to screen
#add clock to game loop

#start main player loop
#-roll dice, add resources to players
#player can build city, road, buy card, trade(player or bank)
#robber stops resources
#points (houses, city, longest road, victory points, army)