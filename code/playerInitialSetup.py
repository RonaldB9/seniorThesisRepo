import pygame
from selectHouses import selectHouse
from drawBoard import drawGame
from resources import addResources

def playerTurn(event, player_num, color, houseOption_choices, selectedHouse, house_options_drawn, housesPlayers,
               housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4,
               resourceTiles, resourceTokens,
               dice_rect, dice_rect_end_turn, screen, my_font, playerResources, house_to_tile_map, housePlacements):

    # Draw available houses (only once per turn)
    if not house_options_drawn:
        for house in houseOption_choices:
            x, y = house['position']
            pygame.draw.circle(screen, color, (x, y), 5)
        pygame.display.update()
        house_options_drawn = True

    if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
        mouse_pos = event.pos

        # Only allow house placement if none selected yet
        if selectedHouse is None:
            selected = selectHouse(mouse_pos, color, houseOption_choices, selectedHouse, screen)
            if selected is not None:
                housesPlayers.append(selected)

                # If it's the second house placement, give resources
                if housePlacements == 1:
                    addResources(selected['position'], resourceTiles, house_to_tile_map, playerResources)

                # Redraw the board with the new house
                drawGame(housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4,
                         resourceTiles, resourceTokens, dice_rect, dice_rect_end_turn, screen, my_font)

                selectedHouse = selected
                return True, selectedHouse, house_options_drawn  # ✅ End turn immediately after placing house

    return False, selectedHouse, house_options_drawn