# MLB Blender Simulation

This project simulates Major League Baseball (MLB) plays using the Blender API. It takes into account various parameters such as launch angle, exit velocity, pitch type, and pitch velocity to create realistic simulations of plays like home runs.

## Project Structure

```
mlb-blender-sim
├── src
│   ├── main.py               # Entry point for the application
│   ├── blender_api           # Contains functions to interface with the Blender API
│   │   └── __init__.py
│   ├── simulation            # Defines the simulation logic
│   │   └── __init__.py
│   ├── data                  # Handles incoming data related to MLB plays
│   │   └── __init__.py
│   └── utils                 # Contains utility functions
│       └── __init__.py
├── requirements.txt          # Lists project dependencies
└── README.md                 # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd mlb-blender-sim
   ```

2. **Install dependencies:**
   Ensure you have Blender installed and set up on your system. Then, install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. **Run the simulation:**
   Execute the main script to start the simulation:
   ```
   python src/main.py
   ```

## Usage Guidelines

- The simulation can be customized by modifying the parameters in `src/main.py`.
- Incoming data should be formatted correctly to ensure accurate simulations.
- Refer to the individual module documentation for more details on specific functionalities.

## Overview of Functionality

- **Blender API Integration:** The project utilizes the Blender API to create and manipulate 3D objects and scenes.
- **Simulation Logic:** The simulation module handles the creation of plays based on input parameters and manages the execution timing.
- **Data Handling:** The data module is responsible for parsing and validating incoming data related to MLB plays.
- **Utility Functions:** Various helper functions are provided to support calculations and data formatting throughout the application.