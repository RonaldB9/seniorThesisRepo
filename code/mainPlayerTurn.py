from dice import rollDice
from resources import addResourcesAfterRoll

def playerMainTurn(screen, my_font, current_player_id, player_data, event, dice_rect, dice_rolled):
    #first step is to roll dice
    print(f"Player {current_player_id} turn")
    if not dice_rolled:
        dice_rolled = rollDice(event, dice_rect, dice_rolled, screen, my_font)
        if dice_rolled > 1:
            dice_rolled = True
            # GET A DICE VALUE (you can return it from rollDice if needed)
            print(f"Player {current_player_id} rolled a {dice_rolled}")