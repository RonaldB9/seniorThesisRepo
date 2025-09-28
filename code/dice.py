import pygame
import random

def rollDice(event, dice_rect, dice_rolled, screen, my_font):
    # If left click
    if event.type == pygame.MOUSEBUTTONDOWN and not dice_rolled:
        if dice_rect.collidepoint(event.pos):  # Check if click is inside the dice area
            rand_num = random.randint(1, 6)
            rand_num2 = random.randint(1, 6)
            diceRoll = rand_num + rand_num2

            # Draw dice number
            text_surface = my_font.render(str(diceRoll), True, (0, 0, 0))
            text_rect = text_surface.get_rect(center=dice_rect.center)
            screen.blit(text_surface, text_rect)

            # Update only the dice area
            pygame.display.update(dice_rect)

            return True  #Dice was rolled
    return dice_rolled  #No change