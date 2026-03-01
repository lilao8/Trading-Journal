<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🪙 Cyber-Journal: AI-Powered Trading Audit System

A privacy-focused, high-performance trading journal designed for independent traders. This project demonstrates the power of **Vibe Coding** (Human-AI Collaboration) in building a production-ready local stack.



## ✨ Key Features

- **🤖 AI Insights**: Leverages the Gemini 1.5 Pro engine to analyze trade rationales and provide "soul-searching" critiques on discipline and strategy.
- **🔒 Local-First Privacy**: All data stays on your machine in a SQLite database. No cloud leaks, no subscription fees.
- **⚡ Native Experience**: Custom macOS Automator wrapper allows for a "One-Click" start (checks environment -> starts server -> opens browser).
- **🎨 High-Performance UI**: A Cyberpunk-inspired dark mode interface built with Tailwind CSS, optimized for zero-lag interactions.
- **🔄 Smart Sync**: Integrated `vibe.sh` script automates local backups and pushes code updates to GitHub while strictly excluding sensitive database files.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, tsx
- **Database**: SQLite (Better-SQLite3)
- **AI Integration**: Google AI Studio (Gemini API)
- **Tooling**: Bash, macOS Automator

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone [https://github.com/lilao8/Trading-Journal.git](https://github.com/lilao8/Trading-Journal.git)
   cd Trading-Journal
   npm install

   Environment Setup

2. **Create a .env file in the root:**

   Code snippet
   GEMINI_API_KEY=your_api_key_here
   PORT=3000

3. **Launch**

   Bash
   npm run dev