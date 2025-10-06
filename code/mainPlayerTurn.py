from dice import rollDice
from resources import addResourcesAfterRoll

def playerMainTurn(screen, my_font, current_player_id, player_data, event, dice_rect, dice_rolled, players,
                   resourceTiles, resourceTokens):
    #first step is to roll dice
    if not dice_rolled:
        #get dice value
        dice_value = rollDice(event, dice_rect, dice_rolled, screen, my_font)
        if dice_value > 1:
            dice_rolled = True
            print(f"Player {current_player_id} turn")
            print(f"Player {current_player_id} rolled a {dice_value}")

            #add resources after roll
            for playerNumber in players:
                addResourcesAfterRoll(dice_value, players, playerNumber, resourceTiles, resourceTokens)

        #check points after every action

        #trade

        #build city

        #build road

        #buy development card

        #check if player clicks end turn