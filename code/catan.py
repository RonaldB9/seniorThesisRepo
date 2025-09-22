import pygame
import math
import random

pygame.init()

screen_width = 1000
screen_height = 700
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("Catan")

#draws hexigons
def draw_hexagons(surface, color, center, size, width=0):
    x, y = center
    points = []
    for i in range(6):
        angle_deg = 60 * i - 30  # -30 to make it flat-topped
        angle_rad = math.radians(angle_deg)
        px = x + size * math.cos(angle_rad)
        py = y + size * math.sin(angle_rad)
        points.append((px, py))
    pygame.draw.polygon(surface, color, points, width)

#Randomize resource tiles
#resourceTiles = ["Wood", "Wood", "Wood", "Wood", "Ore", "Ore", "Ore", "Brick", "Brick", "Brick", 
#                       "Wheat", "Wheat", "Wheat", "Wheat", "Desert", "Sheep", "Sheep", "Sheep", "Sheep"]
resourceTiles = [(252, 136, 3), (252, 136, 3), (252, 136, 3), (181, 177, 172), (181, 177, 172), (181, 177, 172), (209, 206, 151),
                 (34, 125, 76), (34, 125, 76), (34, 125, 76), (34, 125, 76), (55, 222, 86), (55, 222, 86), (55, 222, 86),
                 (55, 222, 86), (219, 219, 31), (219, 219, 31), (219, 219, 31), (219, 219, 31)]
random.shuffle(resourceTiles)
#List of resource tokens for each tile. Randomly insert the desert token into the array
resourceTokens = [8, 3, 6, 2, 5, 10, 8, 4, 11, 12, 9, 10, 5, 4, 9, 3, 6, 11]
randomNumber = random.randint(1, 18)
resourceTokens.insert(randomNumber, 0)

#pygame is running
running = True
while running:
    for event in pygame.event.get():
        #if the player quits/exits
        if event.type == pygame.QUIT:
            running = False

    #Clear screen with white
    screen.fill((255, 255, 255))
    
    #draw the hexigons for the board
    x = 390
    tiletracker = 0
    for i in range(3):
        draw_hexagons(screen, resourceTiles[tiletracker], (x, 160), 60)
        pygame.draw.circle(screen, (238, 242, 189), (x, 160), 30, 30)
        x = x + 110
        tiletracker = tiletracker + 1
    x = 335
    for i in range(4):
        draw_hexagons(screen, resourceTiles[tiletracker], (x, 255), 60)
        pygame.draw.circle(screen, (238, 242, 189), (x, 255), 30, 30)
        x = x + 110
        tiletracker = tiletracker + 1
    x = 280
    for i in range(5):
        draw_hexagons(screen, resourceTiles[tiletracker], (x, 350), 60)
        pygame.draw.circle(screen, (238, 242, 189), (x, 350), 30, 30)
        x = x + 110  
        tiletracker = tiletracker + 1
    x = 335
    for i in range(4):
        draw_hexagons(screen, resourceTiles[tiletracker], (x, 445), 60)
        pygame.draw.circle(screen, (238, 242, 189), (x, 445), 30, 30)
        x = x + 110
        tiletracker = tiletracker + 1
    x = 390
    for i in range(3):
        draw_hexagons(screen, resourceTiles[tiletracker], (x, 540), 60)
        pygame.draw.circle(screen, (238, 242, 189), (x, 540), 30, 30)
        x = x + 110
        tiletracker = tiletracker + 1

    pygame.display.flip()

pygame.quit()
