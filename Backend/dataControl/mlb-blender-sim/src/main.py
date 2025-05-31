import sys
import os
import math

# Ensure the script's directory is in sys.path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import bpy
from stadium import create_stadium
from ball import add_ball
from animation import animate_play
from utils import set_scene

def set_camera_on_ball(ball):
    # Remove existing cameras
    for obj in bpy.data.objects:
        if obj.type == 'CAMERA':
            bpy.data.objects.remove(obj, do_unlink=True)
    # Add a new camera
    bpy.ops.object.camera_add(location=(ball.location[0]+3, ball.location[1]-8, ball.location[2]+2), rotation=(math.radians(75), 0, math.radians(0)))
    cam = bpy.context.active_object
    cam.name = "SimCamera"
    # Point camera at the ball
    constraint = cam.constraints.new(type='TRACK_TO')
    constraint.target = ball
    constraint.track_axis = 'TRACK_NEGATIVE_Z'
    constraint.up_axis = 'UP_Y'
    # Set as active camera
    bpy.context.scene.camera = cam

def run_simulation(
    stadium_name="Fenway Park",
    launch_angle=30,
    exit_velocity=100,
    pitch_type="fastball",
    pitch_velocity=95,
    spin_rate=2200
):
    set_scene()
    create_stadium(stadium_name)
    # No batter or pitcher
    ball = add_ball(spin_rate=spin_rate, velocity=exit_velocity)
    set_camera_on_ball(ball)
    animate_play(ball, launch_angle, exit_velocity, pitch_type, pitch_velocity)

if __name__ == "__main__":
    # Simulation parameters
    stadium_name = "Yankee Stadium"
    launch_angle = 28
    exit_velocity = 105
    pitch_type = "fastball"
    pitch_velocity = 97
    spin_rate = 2400

    run_simulation(
        stadium_name=stadium_name,
        launch_angle=launch_angle,
        exit_velocity=exit_velocity,
        pitch_type=pitch_type,
        pitch_velocity=pitch_velocity,
        spin_rate=spin_rate
    )

    # Save output .blend file
    output_dir = "C:/Users/gpayn/OneDrive/Desktop/SportsTrading/sports-ah-app/Backend/dataControl/mlb-blender-sim/src/sim_outputs"
    os.makedirs(output_dir, exist_ok=True)
    blend_path = os.path.join(output_dir, "mlb_sim_output.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)

    # Set Eevee as the render engine for fast preview (Blender 4.4+)
    bpy.context.scene.render.engine = 'BLENDER_EEVEE_NEXT'
    # Render animation to video
    bpy.context.scene.render.image_settings.file_format = 'FFMPEG'
    bpy.context.scene.render.ffmpeg.format = 'MPEG4'
    bpy.context.scene.render.filepath = os.path.join(output_dir, "mlb_sim_output.mp4")
    bpy.context.scene.render.ffmpeg.codec = 'H264'
    bpy.context.scene.render.ffmpeg.constant_rate_factor = 'HIGH'
    bpy.context.scene.render.ffmpeg.ffmpeg_preset = 'GOOD'
    bpy.context.scene.render.fps = 24
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = bpy.context.scene.frame_end if bpy.context.scene.frame_end > 1 else 48
    bpy.ops.render.render(animation=True)