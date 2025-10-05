import pygame
from selectHousesAndRoads import selectHouse
from selectHousesAndRoads import selectRoad
from drawBoard import drawGame
from resources import addResources

def playerTurn(event, player_num, color, houseOption_choices, selectedHouse, house_options_drawn, housesPlayers,
               housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4,
               resourceTiles, resourceTokens,
               dice_rect, dice_rect_end_turn, screen, my_font, playerResources, house_to_tile_map, housePlacements,
               road_segments, playerRoads, players, roadOption_choices, roadsChosen, houseOptions):

    # Draw available houses (only once per turn)
    if not house_options_drawn:
        for house in houseOption_choices:
            x, y = house['position']
            pygame.draw.circle(screen, color, (x, y), 5)
        pygame.display.update()
        house_options_drawn = True
    #On left click
    if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
        mouse_pos = event.pos
        # Only allow house placement if none selected yet
        if selectedHouse is None:
            #get house if the user clicked a valid house location
            selected = selectHouse(mouse_pos, color, houseOption_choices, selectedHouse, screen)
            if selected is not None:
                housesPlayers.append(selected)
                # If it's the second house placement, give resources
                if housePlacements == 1:
                    addResources(selected['position'], resourceTiles, house_to_tile_map, playerResources)
                # Redraw the board with the new house
                drawGame(housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4,
                         resourceTiles, resourceTokens, dice_rect, dice_rect_end_turn, screen, my_font, road_segments, players,)
                selectedHouse = selected
                #get valid roads 
                roadOption_choices.clear()
                if selectedHouse['position'] in houseOptions:
                    selected_index = houseOptions.index(selectedHouse['position'])
                    # Get all road indices the player already owns
                    player_road_indices = [i for i, road in enumerate(road_segments.keys()) if road in playerRoads]
                    for i, (road_coords, (house_list_1, road_list_2)) in enumerate(road_segments.items()):
                        if selected_index in house_list_1 or any(r in road_list_2 for r in player_road_indices):
                            if road_coords not in playerRoads and road_coords not in roadsChosen:  #avoid offering roads the player already owns
                                roadOption_choices.append(road_coords)
                #draw roads 
                for road in roadOption_choices: 
                    pygame.draw.line(screen, (0, 0, 0), road[0], road[1], 4) 
                pygame.display.update()

        # Place road (must be adjacent — you can validate later)
        elif selectedHouse is not None:
            selected_road = selectRoad(mouse_pos, road_segments, playerRoads, roadsChosen, roadOption_choices)
            #add road to player list and roadsChosen
            if selected_road:
                playerRoads.append(selected_road)
                roadsChosen.append(selected_road)
                #remove road from choices
                if selected_road in roadOption_choices:
                    roadOption_choices.remove(selected_road)
                    
                drawGame(housesPlayer1, housesPlayer2, housesPlayer3, housesPlayer4,
                        resourceTiles, resourceTokens, dice_rect, dice_rect_end_turn,
                        screen, my_font, road_segments, players)
                return True, selectedHouse, house_options_drawn  #End turn immediately after placing house

    return False, selectedHouse, house_options_drawn