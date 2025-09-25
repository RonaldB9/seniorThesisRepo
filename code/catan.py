import pygame
import math
import random

pygame.init()

#screen setup
screen_width = 1000
screen_height = 700
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("Catan")

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

#Randomize resource tiles
resourceTiles = [(252, 136, 3), (252, 136, 3), (252, 136, 3), (181, 177, 172), (181, 177, 172), (181, 177, 172), (209, 206, 151),
                 (34, 125, 76), (34, 125, 76), (34, 125, 76), (34, 125, 76), (55, 222, 86), (55, 222, 86), (55, 222, 86),
                 (55, 222, 86), (219, 219, 31), (219, 219, 31), (219, 219, 31), (219, 219, 31)]
random.shuffle(resourceTiles)
#List of resource tokens for each tile. Randomly insert the desert token into the array
resourceTokens = [8, 3, 6, 2, 5, 10, 8, 4, 11, 12, 9, 10, 5, 4, 9, 3, 6, 11]
# Find the index of the desert tile color
desert_index = resourceTiles.index((209, 206, 151))
# Insert the desert token (0) at the same index
resourceTokens.insert(desert_index, 0)

#font to write text in pygame
pygame.font.init()
my_font = pygame.font.SysFont('Comic Sans MS', 20)

def drawGame():
    #Clear screen with white
    screen.fill((3, 65, 252))
    
    #draw island
    draw_hexagons(screen, (194, 178, 128), (500, 350), 300, 0)
    
    #draw the hexigons for the board in a circle
    x = 390
    for i in range(3):
        draw_hexagons(screen, resourceTiles[i], (x, 160), 60, -30)
        pygame.draw.circle(screen, (255, 255, 255), (x, 170), 25, 25)
        x = x + 110
    draw_hexagons(screen, resourceTiles[3], (665, 255), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (665, 265), 25, 25)
    draw_hexagons(screen, resourceTiles[4], (720, 350), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (720, 360), 25, 25)
    draw_hexagons(screen, resourceTiles[5], (665, 445), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (665, 455), 25, 25)
    draw_hexagons(screen, resourceTiles[6], (610, 540), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (610, 550), 25, 25)
    draw_hexagons(screen, resourceTiles[7], (500, 540), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (500, 550), 25, 25)
    draw_hexagons(screen, resourceTiles[8], (390, 540), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (390, 550), 25, 25)
    draw_hexagons(screen, resourceTiles[9], (335, 445), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (335, 455), 25, 25)
    draw_hexagons(screen, resourceTiles[10], (280, 350), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (280, 360), 25, 25)
    draw_hexagons(screen, resourceTiles[11], (335, 255), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (335, 265), 25, 25)
    draw_hexagons(screen, resourceTiles[12], (445, 255), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (445, 265), 25, 25)
    draw_hexagons(screen, resourceTiles[13], (555, 255), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (555, 265), 25, 25)
    draw_hexagons(screen, resourceTiles[14], (610, 350), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (610, 360), 25, 25)
    draw_hexagons(screen, resourceTiles[15], (555, 445), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (555, 455), 25, 25)
    draw_hexagons(screen, resourceTiles[16], (445, 445), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (445, 455), 25, 25)
    draw_hexagons(screen, resourceTiles[17], (390, 350), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (390, 360), 25, 25)
    draw_hexagons(screen, resourceTiles[18], (500, 350), 60, -30)
    pygame.draw.circle(screen, (255, 255, 255), (500, 360), 25, 25)
    
    #place tokens
    screen.blit(my_font.render(str(resourceTokens[0]), False, (0, 0, 0)), (385, 155))
    screen.blit(my_font.render(str(resourceTokens[1]), False, (0, 0, 0)), (495, 155))
    screen.blit(my_font.render(str(resourceTokens[2]), False, (0, 0, 0)), (605, 155))
    screen.blit(my_font.render(str(resourceTokens[3]), False, (0, 0, 0)), (660, 250))
    screen.blit(my_font.render(str(resourceTokens[4]), False, (0, 0, 0)), (715, 345))
    screen.blit(my_font.render(str(resourceTokens[5]), False, (0, 0, 0)), (660, 440))
    screen.blit(my_font.render(str(resourceTokens[6]), False, (0, 0, 0)), (605, 535))
    screen.blit(my_font.render(str(resourceTokens[7]), False, (0, 0, 0)), (495, 535))
    screen.blit(my_font.render(str(resourceTokens[8]), False, (0, 0, 0)), (385, 535))
    screen.blit(my_font.render(str(resourceTokens[9]), False, (0, 0, 0)), (330, 440))
    screen.blit(my_font.render(str(resourceTokens[10]), False, (0, 0, 0)), (275, 345))
    screen.blit(my_font.render(str(resourceTokens[11]), False, (0, 0, 0)), (330, 250))
    screen.blit(my_font.render(str(resourceTokens[12]), False, (0, 0, 0)), (440, 250))
    screen.blit(my_font.render(str(resourceTokens[13]), False, (0, 0, 0)), (550, 250))
    screen.blit(my_font.render(str(resourceTokens[14]), False, (0, 0, 0)), (605, 345))
    screen.blit(my_font.render(str(resourceTokens[15]), False, (0, 0, 0)), (550, 440))
    screen.blit(my_font.render(str(resourceTokens[16]), False, (0, 0, 0)), (440, 440))
    screen.blit(my_font.render(str(resourceTokens[17]), False, (0, 0, 0)), (385, 345))
    screen.blit(my_font.render(str(resourceTokens[18]), False, (0, 0, 0)), (495, 345))

    #draw ports
    pygame.draw.rect(screen, (0, 0, 0), (300, 30, 50, 50), width=3)
    pygame.draw.rect(screen, (0, 0, 0), (520, 30, 50, 50), width=3)
    pygame.draw.rect(screen, (0, 0, 0), (180, 230, 50, 50), width=3)
    pygame.draw.rect(screen, (0, 0, 0), (710, 140, 50, 50), width=3)
    pygame.draw.rect(screen, (0, 0, 0), (180, 430, 50, 50), width=3)
    pygame.draw.rect(screen, (0, 0, 0), (820, 330, 50, 50), width=3)
    pygame.draw.rect(screen, (0, 0, 0), (300, 610, 50, 50), width=3)
    pygame.draw.rect(screen, (0, 0, 0), (500, 610, 50, 50), width=3)
    pygame.draw.rect(screen, (0, 0, 0), (710, 500, 50, 50), width=3)

    pygame.display.flip()

#pygame is running
running = True
while running:
    for event in pygame.event.get():
        #if the player quits/exits
        if event.type == pygame.QUIT:
            running = False

    drawGame()

    #players loop

pygame.quit()
