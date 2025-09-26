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
desert_tile = resourceTiles.index((209, 206, 151))
# Insert the desert token (0) at the same index
resourceTokens.insert(desert_tile, '')

#font to write text in pygame
pygame.font.init()
my_font = pygame.font.SysFont('Comic Sans MS', 20)

def drawGame():
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
