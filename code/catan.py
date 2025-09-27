import pygame
import math
import random

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

#font to write text in pygame
pygame.font.init()
my_font = pygame.font.SysFont('Comic Sans MS', 20)

#player trackers
current_player = 1
number_of_players = 4

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
houseOption_choices = []
housesPlayer1 = []
housesPlayer2 = []
housesPlayer3 = []
housesPlayer4 = []
choosing_direction = 1
house_options_drawn = False
selectedHouse = None
endOfChoosingHouses = False

#get every house option
for x, y in houseOptions:
    houseOption_choices.append({'position': (x, y)})

#draws hexigons
def draw_hexagons(surface, fill_color, center, size, angle, border_width=2):
    def darken_color(color, amount=0.6):
        r, g, b = color
        return (int(r * amount), int(g * amount), int(b * amount))

    x, y = center
    points = []
    for i in range(6):
        angle_deg = 60 * i - angle  # controls rotation
        angle_rad = math.radians(angle_deg)
        px = x + size * math.cos(angle_rad)
        py = y + size * math.sin(angle_rad)
        points.append((px, py))
    
    # Fill color
    pygame.draw.polygon(surface, fill_color, points, 0)
    # Darker border
    border_color = darken_color(fill_color)
    pygame.draw.polygon(surface, border_color, points, border_width)

def drawGame(housesPlayer1, housesPlayer2, housePlayer3, housePlayer4):
    screen.fill((3, 65, 252))  # Clear screen

    # Get center of screen
    center_x = screen.get_width() // 2
    center_y = screen.get_height() // 2

    # Draw big background island
    draw_hexagons(screen, (194, 178, 128), (center_x, center_y), 300, 0)

    # Hex grid layout offsets (x, y from center)
    hex_offsets = [
        (-110, -190), (0, -190), (110, -190),
        (165, -95), (220, 0), (165, 95),
        (110, 190), (0, 190), (-110, 190),
        (-165, 95), (-220, 0), (-165, -95),
        (-55, -95), (55, -95),
        (110, 0), (55, 95), (-55, 95),
        (-110, 0), (0, 0)
    ]

    for i, (dx, dy) in enumerate(hex_offsets):
        tile_x = center_x + dx
        tile_y = center_y + dy

        # Draw hex tile
        draw_hexagons(screen, resourceTiles[i], (tile_x, tile_y), 60, -30)

        # Draw circle for token background
        pygame.draw.circle(screen, (255, 255, 255), (tile_x, tile_y + 10), 25, 25)

        # Draw resource token number
        token_text = str(resourceTokens[i])
        text_surface = my_font.render(token_text, True, (0, 0, 0))
        text_rect = text_surface.get_rect(center=(tile_x, tile_y + 10))
        screen.blit(text_surface, text_rect)

    #draw ports
    port_offsets = [
    (-200, -300), (50, -310), (-290, -120), (260, -170),
    (320, 0), (240, 170), (50, 300), (-200, 270), (-320, 100)]

    for dx, dy in port_offsets:
        port_x = center_x + dx
        port_y = center_y + dy
        pygame.draw.rect(screen, (0, 0, 0), (port_x - 25, port_y - 25, 50, 50), width=3)

    #draw houses taken
    for house in housesPlayer1:
        x, y = house['position']
        pygame.draw.rect(screen, (255, 0, 0), (x - 5, y - 5, 20, 20))

    for house in housesPlayer2:
        x, y = house['position']
        pygame.draw.rect(screen, (0, 255, 0), (x - 5, y - 5, 20, 20))

    for house in housesPlayer3:
        x, y = house['position']
        pygame.draw.rect(screen, (0, 0, 255), (x - 5, y - 5, 20, 20))

    for house in housesPlayer4:
        x, y = house['position']
        pygame.draw.rect(screen, (0, 255, 255), (x - 5, y - 5, 20, 20))

    #draw Dice
    pygame.draw.rect(screen, (0, 0, 0), dice_rect, width=3)

    #End Turn Button
    pygame.draw.rect(screen, (0, 0, 0), dice_rect_end_turn, width=3)

    pygame.display.flip()

def rollDice(event):
    global dice_rolled
    #if left click
    if event.type == pygame.MOUSEBUTTONDOWN and not dice_rolled:
        if dice_rect.collidepoint(event.pos):  # Check if click is inside the rect
            rand_num = random.randint(1, 6)
            rand_num2 = random.randint(1, 6)
            diceRoll = rand_num + rand_num2

            # Draw dice number
            text_surface = my_font.render(str(diceRoll), True, (0, 0, 0))
            text_rect = text_surface.get_rect(center=dice_rect.center)
            screen.blit(text_surface, text_rect)

            # Update only the dice area
            pygame.display.update(dice_rect)
            dice_rolled = True

def selectHouse(mouse_pos, color):
    global house_options_drawn, selectedHouse
    for house in houseOption_choices:
        hx, hy = house['position']
        radius = 5
        #Check if click is within circle using distance formula
        if (mouse_pos[0] - hx) ** 2 + (mouse_pos[1] - hy) ** 2 <= radius ** 2:
            selectedHouse = house
            #redraw game
            screen.fill((255, 255, 255))
            #drawGame(housesPlayer1, housesPlayer2)
            break
    for house in houseOption_choices:
        x, y = house['position']
        if house == selectedHouse:
            #Draw rectangle in place of selected circle
            pygame.draw.rect(screen, color, (x - 5, y - 5, 20, 20))
            #remove it from the choices
            houseOption_choices.remove(house)
            #remove house options that are too close
            selected_x, selected_y = selectedHouse['position']
            new_house_options = []
            for house in houseOption_choices:
                x, y = house['position']
                dist_squared = (x - selected_x) ** 2 + (y - selected_y) ** 2
                if dist_squared > 75 ** 2:  #Keep only if far enough
                    new_house_options.append(house)
            # Update global list
            houseOption_choices.clear()
            houseOption_choices.extend(new_house_options)
            
    pygame.display.update()
    return selectedHouse

def player1Turn(event):
    global house_options_drawn, selectedHouse
    rollDice(event)
    #draw available houses - some will be taken already
    if not house_options_drawn:
        for house in houseOption_choices:
            x, y = house['position']
            pygame.draw.circle(screen, (255, 0, 0), (x, y), 5)
            #pygame.draw.rect(screen, (0, 0, 0), (x-65, y-65, 130, 130), width=1)
        pygame.display.update()
        house_options_drawn = True

    if event.type == pygame.MOUSEBUTTONDOWN:
        mouse_pos = event.pos
        #end turn
        if event.button == 1:  #Left mouse button
            if dice_rect_end_turn.collidepoint(event.pos):
                print("player 1 ended turn!")
                return True
        #Only allow one selection
        if selectedHouse is None:
            selected = selectHouse(mouse_pos, (255, 0, 0))
            if selected is not None:
                housesPlayer1.append(selected)
                drawGame(housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4)
    return False

def player2Turn(event):
    global house_options_drawn, selectedHouse
    rollDice(event)
    #draw available houses - some will be taken already
    if not house_options_drawn:
        for house in houseOption_choices:
            x, y = house['position']
            pygame.draw.circle(screen, (0, 255, 0), (x, y), 5)
        pygame.display.update()
        house_options_drawn = True

    if event.type == pygame.MOUSEBUTTONDOWN:
        mouse_pos = event.pos
        #end turn
        if event.button == 1:  #Left mouse button
            if dice_rect_end_turn.collidepoint(event.pos):
                print("player 2 ended turn!")
                return True
        #Only allow one selection
        if selectedHouse is None:
            selected = selectHouse(mouse_pos, (0, 255, 0))
            if selected is not None:
                housesPlayer2.append(selected)
                drawGame(housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4)
    return False

def player3Turn(event):
    global house_options_drawn, selectedHouse
    rollDice(event)
    #draw available houses - some will be taken already
    if not house_options_drawn:
        for house in houseOption_choices:
            x, y = house['position']
            pygame.draw.circle(screen, (0, 0, 255), (x, y), 5)
        pygame.display.update()
        house_options_drawn = True

    if event.type == pygame.MOUSEBUTTONDOWN:
        mouse_pos = event.pos
        #end turn
        if event.button == 1:  #Left mouse button
            if dice_rect_end_turn.collidepoint(event.pos):
                print("player 3 ended turn!")
                return True
        #Only allow one selection
        if selectedHouse is None:
            selected = selectHouse(mouse_pos, (0, 255, 0))
            if selected is not None:
                housesPlayer3.append(selected)
                drawGame(housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4)
    return False

def player4Turn(event):
    global house_options_drawn, selectedHouse
    rollDice(event)
    #draw available houses - some will be taken already
    if not house_options_drawn:
        for house in houseOption_choices:
            x, y = house['position']
            pygame.draw.circle(screen, (0, 255, 255), (x, y), 5)
        pygame.display.update()
        house_options_drawn = True

    if event.type == pygame.MOUSEBUTTONDOWN:
        mouse_pos = event.pos
        #end turn
        if event.button == 1:  #Left mouse button
            if dice_rect_end_turn.collidepoint(event.pos):
                print("player 3 ended turn!")
                return True
        #Only allow one selection
        if selectedHouse is None:
            selected = selectHouse(mouse_pos, (0, 255, 0))
            if selected is not None:
                housesPlayer4.append(selected)
                drawGame(housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4)
    return False
 
#pygame is running
running = True
drawGame(housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4)
while running:
    for event in pygame.event.get():
        #if the player quits/exits
        if event.type == pygame.QUIT:
            running = False
        #choosing houses loop
        if not endOfChoosingHouses:
            if current_player == 1:
                if player1Turn(event):
                    house_options_drawn = False
                    selectedHouse = None
                    if choosing_direction == 1:
                        current_player = 2
                    else:
                        endOfChoosingHouses = True
            elif current_player == 2:
                if player2Turn(event):
                    print("b")
                    house_options_drawn = False
                    selectedHouse = None
                    current_player = 3 if choosing_direction == 1 else 1
            elif current_player == 3:
                if player3Turn(event):
                    house_options_drawn = False
                    selectedHouse = None
                    current_player = 4 if choosing_direction == 1 else 2
            elif current_player == 4:
                if player4Turn(event):
                    house_options_drawn = False
                    selectedHouse = None
                    if choosing_direction == 1:
                        choosing_direction = -1  #Start going backwards
                    else:
                        current_player = 3  #Go to 3 next (reverse)
            
pygame.quit()
