from physics import calculate_trajectory
import bpy
import math

def animate_play(ball, launch_angle, exit_velocity, pitch_type, pitch_velocity, batter_side="right"):
    # --- PARAMETERS ---
    mound_y = 18.44  # meters (pitcher's mound y)
    mound_z = 1.0    # lower release for demo
    frame_rate = 24
    # Home plate at y=0 (origin)
    plate_y = 0.0
    # Bat parameters
    bat_x = -0.15 if batter_side == "right" else 0.15
    bat_y = 0.0
    bat_z = 1.0
    bat_length = 1.06  # meters (42 inches)
    bat_radius = 0.033
    # Create the bat so the knob (pivot) is at (bat_x, bat_y, bat_z)
    bpy.ops.mesh.primitive_cylinder_add(radius=bat_radius, depth=bat_length, location=(bat_x, bat_y - bat_length/2, bat_z))
    bat = bpy.context.active_object
    bat.name = "Bat"
    bat.rotation_mode = 'XYZ'
    # Move origin to knob (bottom of bat)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR', center='MEDIAN')
    bpy.context.scene.cursor.location = (bat_x, bat_y, bat_z)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    # Initial pose: bat angled back
    bat.rotation_euler = (math.radians(90), math.radians(-70 if batter_side == "right" else 70), math.radians(-60 if batter_side == "right" else 60))
    bat.keyframe_insert(data_path="rotation_euler", frame=1)
    bat.keyframe_insert(data_path="location", frame=1)
    # Animate bat swing: fast arc across the plate
    swing_start = 1
    swing_contact = 7
    swing_end = 14
    # Move bat forward and rotate for contact
    bat.rotation_euler = (math.radians(90), 0, 0)
    bat.keyframe_insert(data_path="rotation_euler", frame=swing_contact)
    # Follow-through: bat finishes across the plate
    bat.rotation_euler = (math.radians(90), math.radians(40 if batter_side == "right" else -40), math.radians(50 if batter_side == "right" else -50))
    bat.keyframe_insert(data_path="rotation_euler", frame=swing_end)
    # Animate pitch: Ball travels from mound to home plate (origin)
    pitch_speed = pitch_velocity * 0.44704  # mph to m/s
    pitch_time = (mound_y - plate_y) / pitch_speed
    g = 9.81
    pitch_frames = int(pitch_time * frame_rate)
    start_z = mound_z
    end_z = bat_z
    contact_frame = swing_contact
    for f in range(pitch_frames + 1):
        t = f / frame_rate
        y = mound_y - pitch_speed * t
        x = 0.0
        z = start_z + (end_z - start_z) * (1 - (y - plate_y) / (mound_y - plate_y)) - 0.5 * g * t * t * 0.25
        ball.location = (x, y, z)
        ball.keyframe_insert(data_path="location", frame=f+1)
        if y <= plate_y and f+1 >= contact_frame:
            break
    # Ball launch after contact (hard hit)
    traj = calculate_trajectory(
        launch_angle, exit_velocity,
        frame_offset=contact_frame,
        frame_rate=frame_rate,
        axis="y",
        batter_x=0.0,
        batter_y=0.0,
        batter_z=bat_z
    )
    for x, y, z, frame in traj:
        ball.location = (x, y, z)
        ball.keyframe_insert(data_path="location", frame=frame)

def calculate_trajectory(launch_angle, exit_velocity, frame_offset=1, frame_rate=24, axis="y", batter_x=0, batter_y=0, batter_z=1):
    v0 = exit_velocity * 0.44704  # mph to m/s
    angle_rad = math.radians(launch_angle)
    vy = v0 * math.cos(angle_rad)
    vz = v0 * math.sin(angle_rad)
    g = 9.81
    t_flight = (vz + math.sqrt(vz**2 + 2 * g * batter_z)) / g  # time until z=0
    frames = int(t_flight * frame_rate)
    points = []
    for f in range(frames):
        t = f / frame_rate
        x = batter_x
        y = batter_y + vy * t  # Ball moves out along y axis from contact point
        z = batter_z + vz * t - 0.5 * g * t * t
        if z < 0:
            z = 0
        points.append((x, y, z, frame_offset + f))
        if z == 0:
            break
    return points