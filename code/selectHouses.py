import pygame

def selectHouse(mouse_pos, color, houseOption_choices, selectedHouse, screen):
    for house in houseOption_choices:
        hx, hy = house['position']
        radius = 5
        # Check if click is within circle using distance formula
        if (mouse_pos[0] - hx) ** 2 + (mouse_pos[1] - hy) ** 2 <= radius ** 2:
            selectedHouse = house
            screen.fill((255, 255, 255))  # Clear screen
            break

    for house in houseOption_choices[:]:  # Use copy of list to safely remove
        x, y = house['position']
        if house == selectedHouse:
            # Draw rectangle for selected house
            pygame.draw.rect(screen, color, (x - 5, y - 5, 20, 20))

            # Remove selected
            houseOption_choices.remove(house)

            # Filter out houses too close
            selected_x, selected_y = selectedHouse['position']
            new_house_options = []
            for h in houseOption_choices:
                hx, hy = h['position']
                dist_squared = (hx - selected_x) ** 2 + (hy - selected_y) ** 2
                if dist_squared > 75 ** 2:
                    new_house_options.append(h)

            # Update the choices list
            houseOption_choices.clear()
            houseOption_choices.extend(new_house_options)

    pygame.display.update()
    return selectedHouse
