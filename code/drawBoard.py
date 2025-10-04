import pygame
import math

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

def drawGame(housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4, resourceTiles, resourceTokens, 
            dice_rect, dice_rect_end_turn, screen, my_font, road_segments=None, players=None):
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

    if players:
        for player in players.values():
            for road in player['roads']:
                pygame.draw.line(screen, player['color'], road[0], road[1], 6)

    #draw Dice
    pygame.draw.rect(screen, (0, 0, 0), dice_rect, width=3)
    #Roll Dice text
    text_surface = my_font.render("Roll Dice", True, (0, 0, 0))
    text_rect = text_surface.get_rect(center=dice_rect.center)
    screen.blit(text_surface, text_rect)

    #End Turn Button
    pygame.draw.rect(screen, (0, 0, 0), dice_rect_end_turn, width=3)
    text_surface = my_font.render("End Turn", True, (0, 0, 0))
    text_rect = text_surface.get_rect(center=dice_rect_end_turn.center)
    screen.blit(text_surface, text_rect)

    pygame.display.flip()