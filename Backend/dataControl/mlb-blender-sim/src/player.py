import bpy
import math

# Remove add_batter and add_pitcher functions for this minimal bat/ball demo.

# Bat (between hands)
bat_x = 0
bat_y = 0
bat_z = 0
bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=0.82, location=(bat_x, bat_y, bat_z))
bat = bpy.context.active_object
bat.name = "Bat"
bat.rotation_euler[0] = math.radians(90)
bat.rotation_euler[1] = math.radians(-60)