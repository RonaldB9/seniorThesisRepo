#resource mapping
tile_color_to_resource = {
    (252, 136, 3): 'brick',
    (181, 177, 172): 'ore',
    (209, 206, 151): 'desert',
    (34, 125, 76): 'wood',
    (55, 222, 86): 'sheep',
    (219, 219, 31): 'wheat'
}

def addResources(house_pos, resourceTiles, house_to_tile_map, playerResources):
    tile_indices = house_to_tile_map.get(house_pos, [])
    for tile_index in tile_indices:
        if tile_index >= len(resourceTiles):  # just in case
            continue
        tile_color = resourceTiles[tile_index]
        resource = tile_color_to_resource.get(tile_color)
        if resource and resource != 'desert':
            playerResources.append(resource)
            print("Player resources:", playerResources)