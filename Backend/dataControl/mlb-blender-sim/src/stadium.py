import bpy
import math
import bmesh
import mathutils

# Stadium dimensions in feet (converted to meters)
STADIUM_DIMENSIONS = {
    "American Family Field":  {"L": 332, "C": 400, "R": 325},
    "Angel Stadium":          {"L": 330, "C": 396, "R": 330},
    "Busch Stadium":          {"L": 336, "C": 400, "R": 335},
    "Camden Yards":           {"L": 337, "C": 406, "R": 320},
    "Chase Field":            {"L": 330, "C": 407, "R": 335},
    "Citi Field":             {"L": 335, "C": 405, "R": 330},
    "Citizens Bank Park":     {"L": 330, "C": 401, "R": 329},
    "Comerica Park":          {"L": 345, "C": 420, "R": 330},
    "Coors Field":            {"L": 347, "C": 415, "R": 350},
    "Dodger Stadium":         {"L": 330, "C": 400, "R": 300},
    "Fenway Park":            {"L": 310, "C": 420, "R": 302},
    "Globe Life Field":       {"L": 329, "C": 407, "R": 326},
    "Great American Ball Park": {"L": 328, "C": 404, "R": 325},
    "Guaranteed Rate Field":  {"L": 330, "C": 400, "R": 335},
    "Kauffman Stadium":       {"L": 330, "C": 400, "R": 330},
    "loanDepot Park":         {"L": 340, "C": 420, "R": 335},
    "Minute Maid Park":       {"L": 315, "C": 435, "R": 326},
    "Nationals Park":         {"L": 336, "C": 403, "R": 335},
    "Oracle Park":            {"L": 339, "C": 399, "R": 309},
    "Petco Park":             {"L": 336, "C": 396, "R": 322},
    "PNC Park":               {"L": 325, "C": 399, "R": 320},
    "Progressive Field":      {"L": 325, "C": 405, "R": 325},
    "Rogers Centre":          {"L": 328, "C": 400, "R": 328},
    "Steinbrenner Field":     {"L": 318, "C": 408, "R": 314},
    "Sutter Health Park":     {"L": 330, "C": 403, "R": 325},
    "T-Mobile Park":          {"L": 331, "C": 405, "R": 327},
    "Target Field":           {"L": 339, "C": 404, "R": 328},
    "Truist Park":            {"L": 335, "C": 400, "R": 325},
    "Wrigley Field":          {"L": 355, "C": 400, "R": 353},
    "Yankee Stadium":         {"L": 318, "C": 404, "R": 314},
}

def feet_to_meters(feet):
    return feet * 0.3048

def create_infield():
    base_dist = feet_to_meters(90)
    z = 0.12 + 0.08  # match infield dirt + grass height

    # Diamond points
    home = (0, 0, z)
    first = (base_dist / math.sqrt(2), base_dist / math.sqrt(2), z)
    second = (0, base_dist * math.sqrt(2), z)
    third = (-base_dist / math.sqrt(2), base_dist / math.sqrt(2), z)

    # MLB infield arc radius (dirt edge): 95 feet from the center of the mound
    infield_arc_radius = feet_to_meters(95)
    # MLB grass island radius (center infield grass): 18 feet from mound center
    grass_island_radius = feet_to_meters(18)
    # Mound center
    mound_dist = feet_to_meters(60.5)
    mound_center = (0, mound_dist, z+0.012)

    # Infield dirt ring (subtract grass island)
    # 1. Create dirt disk (infield arc)
    bpy.ops.mesh.primitive_circle_add(vertices=128, radius=infield_arc_radius, location=mound_center)
    dirt = bpy.context.active_object
    dirt.name = "InfieldDirt"
    bpy.ops.object.editmode_toggle()
    bpy.ops.mesh.fill()
    bpy.ops.object.editmode_toggle()
    mat_dirt = bpy.data.materials.new(name="DirtMat")
    mat_dirt.diffuse_color = (0.6, 0.4, 0.2, 1)
    dirt.data.materials.append(mat_dirt)

    # 2. Create grass island (center infield grass)
    bpy.ops.mesh.primitive_circle_add(vertices=64, radius=grass_island_radius, location=mound_center)
    grass_island = bpy.context.active_object
    grass_island.name = "InfieldGrassIsland"
    bpy.ops.object.editmode_toggle()
    bpy.ops.mesh.fill()
    bpy.ops.object.editmode_toggle()
    mat_grass = bpy.data.materials.new(name="InfieldGrassMat")
    mat_grass.diffuse_color = (0.18, 0.6, 0.18, 1)
    grass_island.data.materials.append(mat_grass)

    # Basepaths (dirt rectangles)
    path_width = 1.0
    for start, end, name in [
        (home, first, "Basepath_Home_First"),
        (first, second, "Basepath_First_Second"),
        (second, third, "Basepath_Second_Third"),
        (third, home, "Basepath_Third_Home"),
    ]:
        sx, sy, _ = start
        ex, ey, _ = end
        length = math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2)
        midx = (sx + ex) / 2
        midy = (sy + ey) / 2
        angle = math.atan2(ey - sy, ex - sx)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(midx, midy, z+0.013))
        path = bpy.context.active_object
        path.name = name
        path.scale = (length/2, path_width/2, 0.01)
        path.rotation_euler[2] = angle
        path.data.materials.append(mat_dirt)

    # Bases (bags)
    base_size = 0.381
    base_height = 0.076
    for pos, name in zip([first, second, third], ["FirstBase", "SecondBase", "ThirdBase"]):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(pos[0], pos[1], z + base_height/2))
        base = bpy.context.active_object
        base.name = name
        base.scale = (base_size/2, base_size/2, base_height/2)
        mat = bpy.data.materials.new(name=f"{name}Mat")
        mat.diffuse_color = (1, 1, 1, 1)
        base.data.materials.append(mat)

    # Home plate (pentagon)
    home_plate_width = 0.4318
    home_plate_depth = 0.216
    bpy.ops.mesh.primitive_cube_add(size=1, location=(home[0], home[1], z + 0.01))
    home_plate = bpy.context.active_object
    home_plate.name = "HomePlate"
    home_plate.scale = (home_plate_width/2, home_plate_depth/2, 0.01)
    mat = bpy.data.materials.new(name="HomePlateMat")
    mat.diffuse_color = (1, 1, 1, 1)
    home_plate.data.materials.append(mat)

    # Batters boxes (aligned next to home plate, not offset toward pitcher)
    bb_width = 1.22
    bb_length = 1.83
    home_plate_depth = 0.216
    bb_offset = home_plate_depth/2 + 0.152
    # Right-handed box
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-bb_width/2, bb_offset + bb_length/2, z + 0.01))
    box_r = bpy.context.active_object
    box_r.name = "BattersBoxRight"
    box_r.scale = (bb_width/2, bb_length/2, 0.005)
    mat_bb = bpy.data.materials.new(name="BattersBoxMat")
    mat_bb.diffuse_color = (0.9, 0.9, 0.9, 1)
    box_r.data.materials.append(mat_bb)
    # Left-handed box
    bpy.ops.mesh.primitive_cube_add(size=1, location=(bb_width/2, bb_offset + bb_length/2, z + 0.01))
    box_l = bpy.context.active_object
    box_l.name = "BattersBoxLeft"
    box_l.scale = (bb_width/2, bb_length/2, 0.005)
    box_l.data.materials.append(mat_bb)

    # Catcher's box
    catcher_box_length = 2.59
    catcher_box_width = 1.07
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -catcher_box_length/2 - home_plate_depth/2, z + 0.011))
    catcher_box = bpy.context.active_object
    catcher_box.name = "CatchersBox"
    catcher_box.scale = (catcher_box_width/2, catcher_box_length/2, 0.004)
    mat_cb = bpy.data.materials.new(name="CatchersBoxMat")
    mat_cb.diffuse_color = (0.85, 0.85, 0.85, 1)
    catcher_box.data.materials.append(mat_cb)

    # On-deck circles
    deck_radius = 0.76
    bpy.ops.mesh.primitive_circle_add(vertices=48, radius=deck_radius, location=(-7, 10, z+0.012))
    deck1 = bpy.context.active_object
    deck1.name = "OnDeckCircle1"
    bpy.ops.object.editmode_toggle()
    bpy.ops.mesh.fill()
    bpy.ops.object.editmode_toggle()
    mat_od = bpy.data.materials.new(name="OnDeckMat")
    mat_od.diffuse_color = (0.7, 0.7, 0.7, 1)
    deck1.data.materials.append(mat_od)
    bpy.ops.mesh.primitive_circle_add(vertices=48, radius=deck_radius, location=(7, 10, z+0.012))
    deck2 = bpy.context.active_object
    deck2.name = "OnDeckCircle2"
    bpy.ops.object.editmode_toggle()
    bpy.ops.mesh.fill()
    bpy.ops.object.editmode_toggle()
    deck2.data.materials.append(mat_od)

    # Pitcher's rubber
    rubber_width = 0.152
    rubber_length = 0.61
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, mound_dist, z + 0.13))
    rubber = bpy.context.active_object
    rubber.name = "PitchersRubber"
    rubber.scale = (rubber_width/2, rubber_length/2, 0.01)
    mat_rub = bpy.data.materials.new(name="RubberMat")
    mat_rub.diffuse_color = (1, 1, 1, 1)
    rubber.data.materials.append(mat_rub)

def create_pitchers_mound():
    mound_dist = feet_to_meters(60.5)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.95, depth=0.18, location=(0, mound_dist, 0.09))
    mound = bpy.context.active_object
    mound.name = "PitchersMound"
    mat = bpy.data.materials.new(name="Mound")
    mat.diffuse_color = (0.8, 0.6, 0.3, 1)
    mound.data.materials.append(mat)

def create_outfield_wall(stadium_name):
    dims = STADIUM_DIMENSIONS.get(stadium_name, STADIUM_DIMENSIONS["Fenway Park"])
    wall_height = 3.0
    segments = 128

    # Angles: LF (3rd base line) = 135°, CF = 90°, RF (1st base line) = 45°
    angle_L = math.radians(135)
    angle_C = math.radians(90)
    angle_R = math.radians(45)

    dist_L = feet_to_meters(dims["L"])
    dist_C = feet_to_meters(dims["C"])
    dist_R = feet_to_meters(dims["R"])

    verts = []
    faces = []

    for i in range(segments + 1):
        t = i / segments
        if t < 0.5:
            angle = angle_L + (angle_C - angle_L) * (t * 2)
            dist = dist_L + (dist_C - dist_L) * (t * 2)
        else:
            angle = angle_C + (angle_R - angle_C) * ((t - 0.5) * 2)
            dist = dist_C + (dist_R - dist_C) * ((t - 0.5) * 2)
        x = dist * math.cos(angle)
        y = dist * math.sin(angle)
        verts.append((x, y, 0))
        verts.append((x, y, wall_height))

    for i in range(segments):
        faces.append((i*2, i*2+1, i*2+3, i*2+2))

    mesh = bpy.data.meshes.new("OutfieldWall")
    obj = bpy.data.objects.new("OutfieldWall", mesh)
    bpy.context.collection.objects.link(obj)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    mat = bpy.data.materials.new(name="Wall")
    mat.diffuse_color = (0.2, 0.2, 0.2, 1)
    obj.data.materials.append(mat)

    # Add wall padding (top edge)
    for i in range(0, segments+1, 8):
        x1, y1, _ = verts[i]
        bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=1.2, location=(x1, y1, wall_height+0.06), rotation=(0,0,0))
        pad = bpy.context.active_object
        pad.name = f"WallPad_{i}"
        mat_pad = bpy.data.materials.new(name=f"WallPadMat_{i}")
        mat_pad.diffuse_color = (0.1, 0.1, 0.5, 1)
        pad.data.materials.append(mat_pad)

def create_foul_line_walls(stadium_name):
    dims = STADIUM_DIMENSIONS.get(stadium_name, STADIUM_DIMENSIONS["Fenway Park"])
    wall_height = 3.0
    wall_thickness = 0.5

    # LF line: from home plate to just before the left field wall (leave a gap)
    angle_L = math.radians(135)
    dist_L = feet_to_meters(dims["L"])
    gap = 1.0  # meters, separation from outfield wall
    lf_length = dist_L - gap
    x_L = lf_length * math.cos(angle_L)
    y_L = lf_length * math.sin(angle_L)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x_L/2, y_L/2, wall_height/2))
    wall_lf = bpy.context.active_object
    wall_lf.name = "WallLFLine"
    wall_lf.scale = (wall_thickness, lf_length/2, wall_height/2)
    wall_lf.rotation_euler[2] = angle_L - math.radians(90)
    mat = bpy.data.materials.new(name="WallLFMat")
    mat.diffuse_color = (0.8, 0.8, 0.2, 1)
    wall_lf.data.materials.append(mat)

    # RF line: from home plate to just before the right field wall (leave a gap)
    angle_R = math.radians(45)
    dist_R = feet_to_meters(dims["R"])
    rf_length = dist_R - gap
    x_R = rf_length * math.cos(angle_R)
    y_R = rf_length * math.sin(angle_R)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x_R/2, y_R/2, wall_height/2))
    wall_rf = bpy.context.active_object
    wall_rf.name = "WallRFLine"
    wall_rf.scale = (wall_thickness, rf_length/2, wall_height/2)
    wall_rf.rotation_euler[2] = angle_R - math.radians(90)
    mat2 = bpy.data.materials.new(name="WallRFMat")
    mat2.diffuse_color = (0.8, 0.8, 0.2, 1)
    wall_rf.data.materials.append(mat2)

    # Foul poles
    pole_height = 10.0
    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=pole_height, location=(x_L, y_L, pole_height/2))
    pole_l = bpy.context.active_object
    pole_l.name = "FoulPoleLF"
    mat_fp = bpy.data.materials.new(name="FoulPoleMat")
    mat_fp.diffuse_color = (1, 1, 0, 1)
    pole_l.data.materials.append(mat_fp)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=pole_height, location=(x_R, y_R, pole_height/2))
    pole_r = bpy.context.active_object
    pole_r.name = "FoulPoleRF"
    pole_r.data.materials.append(mat_fp)

def create_field():
    # Outfield grass: thick cylinder, raised, covers entire field
    outfield_radius = feet_to_meters(420)
    grass_height = 0.08
    bpy.ops.mesh.primitive_cylinder_add(radius=outfield_radius, depth=grass_height, location=(0, 70, grass_height/2))
    field = bpy.context.active_object
    field.name = "OutfieldGrass"
    mat_grass = bpy.data.materials.new(name="Grass")
    mat_grass.diffuse_color = (0.2, 0.7, 0.2, 1)
    field.data.materials.append(mat_grass)

    # Infield grass island: thick disk, raised well above outfield grass and any infield dirt
    base_dist = feet_to_meters(90)
    grass_island_radius = base_dist * 0.38
    grass_island_height = 0.09
    # Raise the infield grass island higher (e.g., +0.15 above outfield grass)
    bpy.ops.mesh.primitive_cylinder_add(radius=grass_island_radius, depth=grass_island_height, location=(0, base_dist/2, grass_height + grass_island_height/2 + 0.15))
    grass_island = bpy.context.active_object
    grass_island.name = "InfieldGrassIsland"
    grass_island.data.materials.append(mat_grass)

    # On-deck circles: outside infield, raised above grass
    deck_radius = 0.76
    deck_z = grass_height + 0.04
    infield_edge = base_dist * 0.95
    bpy.ops.mesh.primitive_circle_add(vertices=48, radius=deck_radius, location=(-10, infield_edge + 10, deck_z))
    deck1 = bpy.context.active_object
    deck1.name = "OnDeckCircle1"
    bpy.ops.object.editmode_toggle()
    bpy.ops.mesh.fill()
    bpy.ops.object.editmode_toggle()
    mat_od = bpy.data.materials.new(name="OnDeckMat")
    mat_od.diffuse_color = (0.7, 0.7, 0.7, 1)
    deck1.data.materials.append(mat_od)
    bpy.ops.mesh.primitive_circle_add(vertices=48, radius=deck_radius, location=(10, infield_edge + 10, deck_z))
    deck2 = bpy.context.active_object
    deck2.name = "OnDeckCircle2"
    bpy.ops.object.editmode_toggle()
    bpy.ops.mesh.fill()
    bpy.ops.object.editmode_toggle()
    deck2.data.materials.append(mat_od)

def create_stadium(stadium_name="Fenway Park"):
    create_field()
    create_infield()
    create_pitchers_mound()
    create_outfield_wall(stadium_name)
    create_foul_line_walls(stadium_name)
