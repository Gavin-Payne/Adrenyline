def calculate_trajectory(launch_angle, exit_velocity, frame_offset=1, frame_rate=24, axis="y", batter_x=0):
    import math
    v0 = exit_velocity * 0.44704  # mph to m/s
    angle_rad = math.radians(launch_angle)
    vx = v0 * math.cos(angle_rad)
    vz = v0 * math.sin(angle_rad)
    g = 9.81
    t_flight = (2 * vz) / g
    frames = int(t_flight * frame_rate)
    points = []
    for f in range(frames):
        t = f / frame_rate
        x = batter_x  # Ball stays at batter's x
        y = 0 + vx * t  # Ball moves out along y axis from home plate
        z = 1 + vz * t - 0.5 * g * t * t
        if z < 0:
            z = 0
        points.append((x, y, z, frame_offset + f))
        if z == 0:
            break
    return points