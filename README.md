# TradingJournal

A professional-grade trading log and journal application designed for scalp traders and investors. TradingJournal provides a high-performance interface to track executions, analyze performance, and maintain a disciplined trading psychology through AI-powered reviews.

## 🚀 Key Features

- **Execution Logging**: Specialized tracking for **Options** and **ETFs** with support for Long/Short sides and fee calculation.
- **AI Deep Review**: Integrated with **Google Gemini AI** to provide professional, blunt, and insightful feedback on your trade entries and exits.
- **Performance Dashboard**:
  - **Equity Curve**: Visual representation of cumulative performance.
  - **Key Metrics**: Real-time calculation of Win Rate, Profit Factor, Average Win/Loss, and Total PnL.
- **Trading Thoughts (Journal)**: A dedicated space for recording market sentiment, weekly reviews, and psychological notes. Entries are automatically sorted by date and creation time.
- **Market Time Alignment**: Optimized for US markets with default **EST (Eastern Standard Time)** handling for all date and time entries.
- **Safe Shutdown & Backup**: Integrated shutdown control that triggers an automated backup process (`backup.sh`) before safely exiting the application.
- **Modern Dark UI**: A high-contrast, distraction-free interface built with **Tailwind CSS** and **Framer Motion** for smooth, professional interactions.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide React.
- **Backend**: Node.js, Express.
- **Database**: SQLite (via `better-sqlite3`) for robust, local data persistence.
- **AI Integration**: Google Gemini API (`@google/genai`).

## 📦 Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Ensure you have a `.env` file with your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## 📂 Project Structure

- `/src/components`: Reusable UI components (TradeForm, TradeList, StatsDashboard, Journal).
- `/src/lib`: Utility functions for PnL calculation and EST date handling.
- `/server.ts`: Express server with SQLite integration and Vite middleware.
- `/trades.db`: Local SQLite database file.

## 🛡 Security & Persistence

- **Local Storage**: All trade data and journal entries are stored locally in a SQLite database.
- **Automated Backups**: The application supports a `backup.sh` script that runs automatically upon clicking the Shutdown button in the header.

---
*Built for traders who demand precision and discipline.*
