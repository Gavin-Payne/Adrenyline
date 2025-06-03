
# Imperium: Sports Prediction Market App

Imperium is a full-stack web application that gamifies sports predictions using a dual-currency system, real-time data, and a social trading marketplace. Users can create, buy, and track predictions on player performances, leveraging real-world sports outcomes for in-game rewards.

---

## Features

### 🏆 Sports Prediction Market
- **Create Predictions:** Users can create custom predictions on player stats (points, rebounds, assists, etc.) for upcoming NBA and MLB games.
- **Auction House:** Predictions are listed in a marketplace where others can buy the opposite side, forming a peer-to-peer prediction market.
- **Active Auctions:** Track all open positions and monitor real-time updates during games.
- **Box Scores & Results:** View detailed player statistics and see which predictions were successful after games complete.

### 💰 Dual Currency System
- **SBM (Soybean Meal Market):** In-game currency based on soybean meal futures.
- **ALU (Aluminum):** Premium in-game currency based on aluminum futures.
- **Market-Driven Pricing:** Currency prices and shop packages fluctuate based on real commodity markets.
- **In-App Purchases:** Users can buy currency packages in the shop, with discounts for larger bundles.

### 📈 Statistics & Leaderboards
- **Personal Stats:** Track win rate, trading history, and total earnings in the Settings section.
- **Leaderboard:** Compete with other users for the highest currency balances.

### 👤 Authentication & Security
- **Sign Up / Sign In:** Secure authentication with JWT tokens.
- **Google OAuth:** Sign in with Google for a seamless experience.
- **Daily Rewards:** Claim daily currency bonuses.

### 🏟️ Real-Time Data & MLB Simulation
- **Live Games:** View live game data and updates.

### 🎓 Onboarding & Tutorial
- **Interactive Tutorial:** New users are guided through the app’s features with an animated, step-by-step tutorial.

---

## Tech Stack

- **Frontend:** React, Framer Motion, React Icons, custom CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose), SQLite (for legacy/MLB data)
- **Authentication:** JWT, Google OAuth
- **Data:** Real-time sports data, commodity price APIs, MLB simulation via Blender
- **Build Tools:** Webpack, Babel, custom scripts for build/start/test

---

## Project Structure

```
Backend/
  server.js           # Express server entry point
  routes/             # API endpoints (auth, user, auctions, players, mlb, etc.)
  models/             # Mongoose models
  dataControl/        # Data scripts and MLB simulation
  scheduler.js        # Background jobs (e.g., auction processing)
Frontend/
  src/
    components/       # React components (dashboard, trading, shop, etc.)
    hooks/            # Custom React hooks (auth, auctions, currency)
    services/         # API and user service logic
    styles/           # Theming and style objects
    index.js          # React entry point
  public/             # Static assets and HTML
  config/             # Webpack and environment configs
  scripts/            # Build/start/test scripts
mlbDBs/               # MLB SQLite databases
```

---

## Usage

### 1. **Install Dependencies**
```sh
cd Backend
npm install
cd ../Frontend
npm install
```

### 2. **Configure Environment**
- Set up `.env` files in both `Backend/` and `Frontend/` for API keys, MongoDB URI, etc.

### 3. **Run the App**
- **Backend:**  
  ```sh
  cd Backend
  npm start
  ```
- **Frontend:**  
  ```sh
  cd Frontend
  npm start
  ```

### 4. **Access the App**
- In progress, eventually will deploy

---

## Notes

- **Currencies have no real-world value. (for now)** The app is for entertainment and educational purposes only.
- **API Endpoints:** See backend `routes/` for available endpoints (auth, user, auctions, mlb, etc.).

---

## License

uh
