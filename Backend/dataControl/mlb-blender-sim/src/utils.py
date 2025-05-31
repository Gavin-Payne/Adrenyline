import bpy

def set_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.world.color = (0.7, 0.9, 1.0)