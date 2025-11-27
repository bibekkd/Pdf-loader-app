# PDF Loader App

A robust React Native application built with Expo that scans, lists, and opens PDF files from your device. This app provides a seamless experience for managing local PDF documents with a modern, clean user interface.

## 🚀 Features

- **Smart PDF Scanning**:
  - **Android**: Compliant with Scoped Storage. Allows users to select a specific folder to scan for PDFs. The selection is persisted for future app launches.
  - **iOS**: Automatically scans the app's document and cache directories.
- **Duplicate Detection**: Automatically identifies and removes duplicate PDF files based on name and file size, ensuring a clean list.
- **Native PDF Viewing**: Opens PDFs using the device's default PDF viewer (e.g., Google Drive Viewer, Apple Books) for the best reading experience and compatibility.
- **Search & Sort**:
  - Real-time search by file name.
  - Sort by Name, Date Modified, or File Size.
- **File Management**:
  - View file details (size, date).
  - Delete files directly from the app.
- **Modern UI**: Built with a clean, responsive design using custom tab navigation.

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Language**: TypeScript
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **File System**: `expo-file-system` (with legacy support for Android content URIs)
- **Sharing**: `expo-sharing`
- **Icons**: `lucide-react-native` & `@expo/vector-icons`

## ⚙️ Installation & Setup

To run this project, you need to have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository**
   ```bash
   git clone https://github.com/bibekkd/Pdf-loader-app.git
   cd Pdf-loader-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

## 📱 Running the App

### ⚠️ Important: Development Build Required

This app uses native modules and specific file system configurations that work best with a **Development Build** (Prebuild). While some features might work in Expo Go, it is highly recommended to run the prebuild command to ensure all native permissions and file access capabilities (especially for Android Scoped Storage and PDF opening) function correctly.

1. **Generate Native Directories (Prebuild)**
   ```bash
   npx expo prebuild
   ```

2. **Run on Android**
   ```bash
   npx expo run:android
   ```

3. **Run on iOS**
   ```bash
   npx expo run:ios
   ```

## 📂 Project Structure

```
/app
  /(tabs)          # Main tab navigation (Home, Explore)
  pdf-viewer.tsx   # Screen handling PDF opening/viewing logic
  _layout.tsx      # Root layout configuration
/components        # Reusable UI components (PDFCard, EmptyState, SortModal)
/utils
  fileSystem.ts    # Core logic for scanning, copying, and managing files
  formatters.ts    # Helpers for date and size formatting
  permissions.ts   # Permission handling logic
/types             # TypeScript definitions
```

## 🐛 Troubleshooting

- **Android PDF Opening Error**: If you encounter issues opening PDFs on Android, ensure you are using the `npx expo run:android` command rather than Expo Go, as the app uses specific intent handling for content URIs.
- **Duplicate Files**: The app automatically filters duplicates. If you see "missing" files, they might have been detected as duplicates of existing files in the list.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
