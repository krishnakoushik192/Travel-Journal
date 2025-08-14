# 🌍 Travel Journal

A cross-platform mobile app for documenting your travels, built with React Native. Capture memories, photos, locations, and personal notes, with seamless cloud sync and offline support.

---

## 📑 Table of Contents

- [✨ Features](#features)
- [🛠️ Tech Stack](#tech-stack)
- [📁 Project Structure](#project-structure)
- [⚡ Setup & Installation](#setup--installation)
- [🔧 Configuration](#configuration)
- [▶️ Running the App](#running-the-app)
- [🧪 Testing](#testing)
- [📱 Usage](#usage)
- [🤝 Contributing](#contributing)
- [📜 License](#license)

---

## ✨ Features

- 🔐 **User Authentication:** Google Sign-In integration for secure login.
- 👤 **Profile Management:** Edit profile, avatar, bio, and view travel stats.
- 📓 **Journal Entries:** Create, edit, and delete travel logs with photos, location, and notes.
- 🖼️ **Photo Uploads:** Attach multiple images to entries; automatic tagging via Google Vision API.
- 📍 **Location Tracking:** Tag entries with GPS location; view on map.
- 📴 **Offline Support:** Local SQLite storage for entries and images.
- ☁️ **Cloud Sync:** Supabase backend for data backup and multi-device sync.
- 📊 **Statistics:** Track countries visited, total entries, and travel distances.
- 🎨 **Modern UI:** Custom color palette, responsive layouts, and smooth navigation.

---

## 🛠️ Tech Stack

- **Frontend:** React Native, React Navigation, Zustand
- **Backend:** Supabase (Postgres, Auth, Storage)
- **Local Storage:** SQLite, AsyncStorage
- **APIs:** Google Vision API, Google Maps API
- **Other:** React Native Elements, React Native Maps

---

## 📁 Project Structure

```
Travel-Journal/
├── src/
│   ├── assets/           # Images, icons, backgrounds
│   ├── components/       # Reusable UI components
│   ├── screens/          # App screens (Accounts, Journal, etc.)
│   ├── services/         # API clients (Supabase, Vision API)
│   ├── store/            # Zustand state management
│   └── utils/            # Helpers and utilities
├── android/              # Android native project
├── ios/                  # iOS native project
├── __tests__/            # Unit and integration tests
├── App.js                # App entry point
├── package.json
└── README.md
```

---

## ⚡ Setup & Installation

### Prerequisites

- 🟢 Node.js >= 18
- 📦 npm or yarn
- 📱 React Native CLI
- 🤖 Android Studio (for Android)
- 🍏 Xcode & CocoaPods (for iOS)

### Install Dependencies

```bash
git clone https://github.com/yourusername/Travel-Journal.git
cd Travel-Journal
npm install
```

### iOS Setup

```bash
cd ios
pod install
cd ..
```

---

## 🔧 Configuration

1. **API Keys:**  
   Create a `.env` file in the root directory:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_VISION_API_KEY=your_google_vision_api_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

2. **Supabase:**  
   - Create a Supabase project.
   - Set up authentication, storage, and database tables for users and journal entries.

3. **Google Cloud:**  
   - Enable Vision API and Maps API.
   - Set up OAuth credentials for Google Sign-In.

---

## ▶️ Running the App

### Start Metro Bundler

```bash
npm start
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

---

## 🧪 Testing

Run unit and integration tests:

```bash
npm test
```

---

## 📱 Usage

1. **Sign In:**  
   Use Google Sign-In to create or access your account.

2. **Profile:**  
   Edit your profile, avatar, and bio. View travel statistics.

3. **Journal Entries:**  
   - Add new entries with photos, location, and notes.
   - Edit or delete existing entries.
   - View entries on a map.

4. **Sync:**  
   Data is saved locally and synced to Supabase when online.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add YourFeature'`).
4. Push to your branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 📬 Contact

For questions or support, open an issue or email [your-email@domain.com](mailto:your-email@domain.com).

---

**Happy journaling and safe travels!**