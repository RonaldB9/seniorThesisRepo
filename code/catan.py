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
print(center_x)
print(center_y)
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
houseOptions = [
                (center_x-110, center_y-252), (center_x+2, center_y-252), (center_x+112, center_y-252),
            (center_x-163, center_y-222), (center_x-53, center_y-222), (center_x+57, center_y-222), (center_x+167, center_y-222),
            (center_x-163, center_y-157), (center_x-53, center_y-157), (center_x+57, center_y-157), (center_x+167, center_y-157), 
        (center_x-218, center_y-127), (center_x-110, center_y-127), (center_x+2, center_y-127), (center_x+112, center_y-127), (center_x+222, center_y-127),
        (center_x-218, center_y-62), (center_x-110, center_y-62), (center_x+2, center_y-62), (center_x+112, center_y-62), (center_x+222, center_y-62), 
    (center_x-273, center_y-32), (center_x-163, center_y-32), (center_x-53, center_y-32), (center_x+57, center_y-32), (center_x+167, center_y-32), (center_x+272, center_y-32),
    (center_x-273, center_y+33), (center_x-163, center_y+33), (center_x-53, center_y+33), (center_x+57, center_y+33), (center_x+167, center_y+33), (center_x+272, center_y+33), 
        (center_x-218, center_y+58), (center_x-110, center_y+58), (center_x+2, center_y+58), (center_x+112, center_y+58), (center_x+222, center_y+58),   
        (center_x-218, center_y+128), (center_x-110, center_y+128), (center_x+2, center_y+128), (center_x+112, center_y+128), (center_x+222, center_y+128), 
            (center_x-163, center_y+158), (center_x-53, center_y+158), (center_x+57, center_y+158), (center_x+167, center_y+158),  
            (center_x-163, center_y+218), (center_x-53, center_y+218), (center_x+57, center_y+218), (center_x+167, center_y+218), 
                (center_x-110, center_y+248), (center_x+2, center_y+248), (center_x+112, center_y+248)]

#(house coords) : connected tiles
house_to_tile_map = {
    (center_x-110, center_y-252): [0], (center_x+2, center_y-252): [1], (center_x+112, center_y-252): [2],
    (center_x-163, center_y-222): [0], (center_x-53, center_y-222): [0,1], (center_x+57, center_y-222): [1,2], (center_x+167, center_y-222): [2],
    (center_x-163, center_y-157): [0, 11], (center_x-53, center_y-157): [0,1,12], (center_x+57, center_y-157): [1,2,13], (center_x+167, center_y-157): [2,3],
    (center_x-218, center_y-127): [11], (center_x-110, center_y-127): [0,11,12], (center_x+2, center_y-127): [1,12,13], (center_x+112, center_y-127): [2,3,13], (center_x+222, center_y-127): [3],
    (center_x-218, center_y-62): [10,11], (center_x-110, center_y-62): [11,12,17], (center_x+2, center_y-62): [12,13,18], (center_x+112, center_y-62): [3,13,14], (center_x+222, center_y-62): [3,4],
    (center_x-273, center_y-32): [10], (center_x-163, center_y-32): [10,11,17], (center_x-53, center_y-32): [12,17,18], (center_x+57, center_y-32): [13,14,18], (center_x+167, center_y-32): [3,4,14], (center_x+272, center_y-32): [4],
    (center_x-273, center_y+33): [10], (center_x-163, center_y+33): [9,10,17], (center_x-53, center_y+33): [16,17,18], (center_x+57, center_y+33): [14,15,18], (center_x+167, center_y+33): [4,5,14], (center_x+272, center_y+33): [4],
    (center_x-218, center_y+58): [9,10], (center_x-110, center_y+58): [9,16,17], (center_x+2, center_y+58): [15,16,18], (center_x+112, center_y+58): [5,14,15], (center_x+222, center_y+58): [4,5],
    (center_x-218, center_y+128): [9], (center_x-110, center_y+128): [8,9,16], (center_x+2, center_y+128): [7,15,16], (center_x+112, center_y+128): [5,6,15], (center_x+222, center_y+128): [5],
    (center_x-163, center_y+158): [8,9], (center_x-53, center_y+158): [7,8,16], (center_x+57, center_y+158): [6,7,15], (center_x+167, center_y+158): [5,6],
    (center_x-163, center_y+218): [8], (center_x-53, center_y+218): [7,8], (center_x+57, center_y+218): [6,7], (center_x+167, center_y+218): [6],
    (center_x-110, center_y+248): [8], (center_x+2, center_y+248): [7], (center_x+112, center_y+248): [6],
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
    ((center_x-163, center_y-222), (center_x-110, center_y-252)): [ [0,3], [1,6] ],#0
    ((center_x-110, center_y-252), (center_x-53, center_y-222)): [ [0,4], [0,2,7] ], 
    ((center_x-53, center_y-222), (center_x+2, center_y-252)): [ [1,4], [1,3,7] ],
    ((center_x+2, center_y-252), (center_x+57, center_y-222)): [ [1,5], [2,4,8] ], 
    ((center_x+57, center_y-222), (center_x+112, center_y-252)): [ [2,5], [3,5,8] ], 
    ((center_x+112, center_y-252), (center_x+167, center_y-222)): [ [2,6], [4,9] ],

    #2nd row vertical roads
    ((center_x-163, center_y-222), (center_x-163, center_y-157)): [ [3,7], [0,10,11] ], #6
    ((center_x-53, center_y-222), (center_x-53, center_y-157)): [ [4,8], [1,2,12,13] ], 
    ((center_x+57, center_y-222), (center_x+57, center_y-157)): [ [5,9], [3,4,14,15] ], 
    ((center_x+167, center_y-222), (center_x+167, center_y-157)): [ [6,10], [5,16,17] ],

    #3rd row
    ((center_x-218, center_y-127), (center_x-163, center_y-157)): [ [7,11], [6,11,18] ],#10
    ((center_x-163, center_y-157), (center_x-110, center_y-127)): [ [7,12], [6,10,12,19] ], 
    ((center_x-110, center_y-127), (center_x-53, center_y-157)): [ [8,12], [11,19,7,13] ],
    ((center_x-53, center_y-157), (center_x+2, center_y-127)): [ [8,13], [7,12,14,20] ], 
    ((center_x+2, center_y-127), (center_x+57, center_y-157)): [ [9,13], [13,20,8,15] ], 
    ((center_x+57, center_y-157), (center_x+112, center_y-127)): [ [9,14], [8,14,16,21] ],
    ((center_x+112, center_y-127), (center_x+167, center_y-157)): [ [10,14], [15,21,9,17] ], 
    ((center_x+167, center_y-157), (center_x+222, center_y-127)): [ [10,15], [16,9,22] ],
    
    #4th row
    ((center_x-218, center_y-127), (center_x-218, center_y-62)): [ [11,16], [10,23,24] ],#18
    ((center_x-110, center_y-127), (center_x-110, center_y-62)): [ [12,17], [11,12,25,26] ], 
    ((center_x+2, center_y-127), (center_x+2, center_y-62)): [ [13,18], [13,14,27,28] ], 
    ((center_x+112, center_y-127), (center_x+112, center_y-62)): [ [14,19], [15,16,29,30] ],
    ((center_x+222, center_y-127), (center_x+222, center_y-62)): [ [15,20], [17,31,32] ],

    #5th row
    ((center_x-273, center_y-32), (center_x-218, center_y-62)): [ [16,21], [18,24,33] ],#23
    ((center_x-218, center_y-62), (center_x-163, center_y-32)): [ [16,22], [18,23,25,34] ], 
    ((center_x-163, center_y-32), (center_x-110, center_y-62)): [ [17,22], [19,24,26,34] ],
    ((center_x-110, center_y-62), (center_x-53, center_y-32)): [ [17,23], [19,25,27,35] ], 
    ((center_x-53, center_y-32), (center_x+2, center_y-62)): [ [18,23], [26,28,35,20] ], 
    ((center_x+2, center_y-62), (center_x+57, center_y-32)): [ [18,24], [20,27,29,36] ],
    ((center_x+57, center_y-32), (center_x+112, center_y-62)): [ [19,24], [21,28,30,36] ], 
    ((center_x+112, center_y-62), (center_x+167, center_y-32)): [ [19,25], [21,29,31,37] ],
    ((center_x+167, center_y-32), (center_x+222, center_y-62)): [ [20,25], [30,32,22,37] ],
    ((center_x+222, center_y-62), (center_x+272, center_y-32)): [ [20,26], [22,31,38] ],

    #6th row
    ((center_x-273, center_y-32), (center_x-273, center_y+33)): [ [21,27], [23,39] ],#33
    ((center_x-163, center_y-32), (center_x-163, center_y+33)): [ [22,28], [24,25,40,41] ], 
    ((center_x-53, center_y-32), (center_x-53, center_y+33)): [ [23,29], [26,27,42,43] ], 
    ((center_x+57, center_y-32), (center_x+57, center_y+33)): [ [24,30], [28,29,44,45] ],
    ((center_x+167, center_y-32), (center_x+167, center_y+33)): [ [25,31], [30,31,46,47] ],
    ((center_x+272, center_y-32), (center_x+272, center_y+33)): [ [26,32], [32,48] ],

    #7th row
    ((center_x-273, center_y+33), (center_x-218, center_y+58)): [ [27,33], [23,40,49] ],#39
    ((center_x-218, center_y+58), (center_x-163, center_y+33)): [ [28,33], [39,49,34,40] ], 
    ((center_x-163, center_y+33), (center_x-110, center_y+58)): [ [28,34], [34,40,42,50] ],
    ((center_x-110, center_y+58), (center_x-53, center_y+33)): [ [29,34], [35,41,43,50] ], 
    ((center_x-53, center_y+33), (center_x+2, center_y+58)): [ [29,35], [35,42,44,51] ], 
    ((center_x+2, center_y+58), (center_x+57, center_y+33)): [ [30,35], [36,43,45,51] ],
    ((center_x+57, center_y+33), (center_x+112, center_y+58)): [ [30,36], [36,44,46,52] ], 
    ((center_x+112, center_y+58), (center_x+167, center_y+33)): [ [31,36], [37,45,47,52] ],
    ((center_x+167, center_y+33), (center_x+222, center_y+58)): [ [31,37], [37,46,48,53] ],
    ((center_x+222, center_y+58), (center_x+272, center_y+33)): [ [32,37], [38,47,53] ],

    #8th row
    ((center_x-218, center_y+58), (center_x-218, center_y+128)): [ [33,38], [39,40,54] ],#49
    ((center_x-110, center_y+58), (center_x-110, center_y+128)): [ [34,39], [41,42,55,56] ], 
    ((center_x+2, center_y+58), (center_x+2, center_y+128)): [ [35,40], [43,44,57,58] ], 
    ((center_x+112, center_y+58), (center_x+112, center_y+128)): [ [36,41], [45,46,59,60] ],
    ((center_x+222, center_y+58), (center_x+222, center_y+128)): [ [37,42], [47,48,61] ],

    #9th row
    ((center_x-218, center_y+128), (center_x-163, center_y+158)): [ [38,43], [49,55,62] ],#54
    ((center_x-163, center_y+158), (center_x-110, center_y+128)): [ [39,43], [54,56,50,62] ], 
    ((center_x-110, center_y+128), (center_x-53, center_y+158)): [ [39,44], [55,57,50,63] ],
    ((center_x-53, center_y+158), (center_x+2, center_y+128)): [ [40,44], [56,58,51,63] ], 
    ((center_x+2, center_y+128), (center_x+57, center_y+158)): [ [40,45], [57,59,51,64] ], 
    ((center_x+57, center_y+158), (center_x+112, center_y+128)): [ [41,45], [58,60,52,64] ],
    ((center_x+112, center_y+128), (center_x+167, center_y+158)): [ [41,46], [59,61,52,65] ], 
    ((center_x+167, center_y+158), (center_x+222, center_y+128)): [ [42,46], [60,53,65] ],

    #10th row vertical roads
    ((center_x-163, center_y+158), (center_x-163, center_y+218)): [ [43,47], [54,55,66] ], #62
    ((center_x-53, center_y+158), (center_x-53, center_y+218)): [ [44,48], [56,57,67,68] ], 
    ((center_x+57, center_y+158), (center_x+57, center_y+218)): [ [45,49], [58,59,69,70] ], 
    ((center_x+167, center_y+158), (center_x+167, center_y+218)): [ [46,50], [60,61,71] ],

    #bottom roads
    ((center_x-163, center_y+218), (center_x-110, center_y+248)): [ [47,51], [62,67] ],#66
    ((center_x-110, center_y+248), (center_x-53, center_y+218)): [ [48,51], [66,68,63] ], 
    ((center_x-53, center_y+218), (center_x+2, center_y+248)): [ [48,52], [67,69,63] ],
    ((center_x+2, center_y+248), (center_x+57, center_y+218)): [ [49,52], [68,70,64] ], 
    ((center_x+57, center_y+218), (center_x+112, center_y+248)): [ [49,53], [69,71,64] ], 
    ((center_x+112, center_y+248), (center_x+167, center_y+218)): [ [50,53], [70,65] ]
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