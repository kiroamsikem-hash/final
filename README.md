# 🏛️ Western Anatolia Timeline

A beautiful and interactive timeline application for exploring the history of Western Anatolia civilizations, built with React Native and Expo.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Expo](https://img.shields.io/badge/Expo-54.0-000020.svg?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?logo=react)

## ✨ Features

- 📱 **Cross-Platform**: Works on Web, iOS, and Android
- 🎨 **Beautiful UI**: Modern, dark-themed interface with smooth animations
- 🗄️ **Database Integration**: MySQL/Google Cloud SQL support with AsyncStorage fallback
- 🔐 **Authentication**: Secure login system
- 📊 **Interactive Timeline**: Zoom, pan, and explore historical events
- 🏛️ **Civilization Management**: Add, edit, and delete civilizations
- 📅 **Event Tracking**: Manage historical events with periods and tags
- 📸 **Media Support**: Add photos to cells and events
- 🔗 **Related Cells**: Link related historical data
- 📤 **Import/Export**: Excel/CSV import and text report export
- 🎯 **Period Filtering**: Filter by historical periods
- 🔍 **Search**: Search events, tags, and descriptions
- 🌐 **Multi-language**: Turkish and English support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- (Optional) MySQL database

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/western-anatolia-timeline.git
cd western-anatolia-timeline/expo
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=timeline_db
DB_PORT=3306
```

4. **Start the development server**
```bash
npx expo start
```

5. **Run on your device**
- **Web**: Press `w` in terminal
- **iOS**: Press `i` (requires Mac with Xcode)
- **Android**: Press `a` (requires Android Studio)
- **Expo Go**: Scan QR code with Expo Go app

## 📦 Project Structure

```
expo/
├── app/                    # Expo Router pages
│   ├── index.tsx          # Main timeline screen
│   ├── login.tsx          # Login screen
│   ├── settings.tsx       # Settings screen
│   └── _layout.tsx        # Root layout with auth
├── components/            # React components
│   ├── TimelineGrid.tsx   # Main timeline grid
│   ├── TimelineHeader.tsx # Timeline header
│   ├── EventCard.tsx      # Event card component
│   ├── InspectorPanel.tsx # Inspector panel
│   ├── CellEditor.tsx     # Cell editor
│   └── Toast.tsx          # Toast notifications
├── context/               # React Context
│   ├── TimelineContext.tsx # Timeline state management
│   └── SettingsContext.tsx # Settings state management
├── lib/                   # Utilities
│   ├── auth.ts           # Authentication service
│   ├── database.ts       # Database service
│   └── turso.ts          # Turso DB integration
├── types/                 # TypeScript types
│   └── index.ts          # Type definitions
├── data/                  # Initial data
│   └── initialData.ts    # Sample data
└── api/                   # API endpoints
    └── mysql.js          # MySQL API handler
```

## 🗄️ Database Setup

### Option 1: Google Cloud SQL (Production)

1. Create a MySQL instance on Google Cloud SQL
2. Import the database schema:
```bash
mysql -h YOUR_HOST -u root -p timeline_db < timeline_database_simple.sql
```

3. Configure firewall rules to allow your IP
4. Update `.env` with your credentials

### Option 2: Local MySQL (Development)

1. Install MySQL locally
2. Create database:
```sql
CREATE DATABASE timeline_db;
```

3. Import schema:
```bash
mysql -u root -p timeline_db < timeline_database_simple.sql
```

4. Update `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=timeline_db
```

### Option 3: Demo Mode (No Database)

The app works without a database using AsyncStorage for local data persistence.

## 🌐 Deployment

### Web (Vercel)

```bash
npm run build
vercel
```

### Mobile (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas update:configure

# Build
eas build --platform all
```

### VPS (Self-hosted)

See [VPS_DEPLOYMENT_GUIDE.md](VPS_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔐 Default Credentials

**Demo Accounts** (when database is not available):
- Username: `admin` / Password: `admin123`
- Username: `demo` / Password: `demo123`

⚠️ **Change these in production!**

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Start web only
npm run start-web

# Build for web
npm run build

# Lint code
npm run lint
```

### Tech Stack

- **Framework**: React Native + Expo
- **Router**: Expo Router
- **State Management**: React Context + Zustand
- **Database**: MySQL / AsyncStorage
- **Styling**: StyleSheet API
- **Icons**: Lucide React Native
- **Data Fetching**: React Query
- **File Handling**: XLSX, Expo Document Picker

## 📱 Screenshots

[Add screenshots here]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Historical data sources
- Expo team for the amazing framework
- All contributors

## 📞 Support

For support, email your.email@example.com or open an issue on GitHub.

---

Made with ❤️ for history enthusiasts
