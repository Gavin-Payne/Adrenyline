import bpy
import math

def add_ball(location=None, spin_rate=2200, velocity=90):
    """
    Adds a baseball to the scene.
    - location: tuple (x, y, z). If None, defaults to pitcher's mound (0, 60.5ft, 1m)
    - spin_rate: in RPM, affects the ball's material and animation (higher = more visible seams)
    - velocity: in mph, affects color (higher = more red)
    """
    # Default location: pitcher's mound, 60.5 ft from home plate along y-axis, 1m above ground
    if location is None:
        location = (0, 18.44, 1)  # 18.44 meters = 60.5 ft

    # Make the ball larger for visibility
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0366, location=location)
    ball = bpy.context.active_object
    ball.name = "Baseball"

    # Create a white material for the ball
    mat = bpy.data.materials.new(name="BaseballMat")
    mat.diffuse_color = (1, 1, 1, 1)
    ball.data.materials.append(mat)

    # Add seams as a red circle (simulate with a torus)
    bpy.ops.mesh.primitive_torus_add(
        location=location,
        major_radius=0.0366,
        minor_radius=0.012 + 0.003 * min(spin_rate/3000, 1),  # thicker seam for higher spin
        rotation=(math.radians(90), 0, 0)
    )
    seam1 = bpy.context.active_object
    seam1.name = "Seam1"
    seam_mat = bpy.data.materials.new(name="SeamMat")
    seam_mat.diffuse_color = (1, 0, 0, 1)
    seam1.data.materials.append(seam_mat)

    # Add a second seam perpendicular to the first
    bpy.ops.mesh.primitive_torus_add(
        location=location,
        major_radius=0.0366,
        minor_radius=0.012 + 0.003 * min(spin_rate/3000, 1),
        rotation=(0, math.radians(90), 0)
    )
    seam2 = bpy.context.active_object
    seam2.name = "Seam2"
    seam2.data.materials.append(seam_mat)

    # Animate ball spin based on spin_rate (RPM)
    scene = bpy.context.scene
    ball.rotation_mode = 'XYZ'
    seam1.rotation_mode = 'XYZ'
    seam2.rotation_mode = 'XYZ'
    frames = int(scene.frame_end if scene.frame_end > 0 else 120)
    spins_per_frame = (spin_rate / 60) / scene.render.fps  # revolutions per frame

    for f in range(1, frames+1):
        angle = 2 * math.pi * spins_per_frame * f
        ball.rotation_euler[0] = angle
        ball.keyframe_insert(data_path="rotation_euler", frame=f)
        seam1.rotation_euler[0] = angle
        seam1.keyframe_insert(data_path="rotation_euler", frame=f)
        seam2.rotation_euler[0] = angle
        seam2.keyframe_insert(data_path="rotation_euler", frame=f)

    # Optionally, color ball slightly redder for higher velocity
    if velocity > 95:
        mat.diffuse_color = (1, 0.8, 0.8, 1)
    elif velocity > 85:
        mat.diffuse_color = (1, 0.9, 0.9, 1)

    return ball