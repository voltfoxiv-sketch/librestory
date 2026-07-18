# LibreStory

LibreStory is a local-first, open-core text adventure engine. 

Instead of relying on a centralized service to run your text adventures, LibreStory acts as a standalone desktop client where you bring your own API keys. It handles the interface, context management, and save files locally on your machine, while plugging directly into whatever language model you prefer to use.

## Features

- **Bring Your Own Key (BYOK)**: Supports OpenRouter, Gemini, and Hugging Face directly out of the box. You control what model you use and how much you spend.
- **Local-First Saves**: Your stories, character sheets, and world info stay on your machine. The app saves state directly to your local storage, with options to export and import full JSON save files.
- **Legacy Import**: Easily drop in your old exported JSON files from AI Dungeon or raw text logs, and the engine will parse them into playable adventures.
- **Immersive UI**: Built to feel like a modern, premium desktop app rather than a web wrapper. Features a distraction-free reading layout, customizable themes, and integrated context management tools like story cards and relationship trackers.
- **Data Privacy**: No tracking, no automated account scraping, and no middleman servers. The client talks directly to the LLM providers.

## Tech Stack

This project is built with:
- **React 19 & Vite**: Fast frontend framework and build tooling.
- **Tailwind CSS & Framer Motion**: For styling, glassmorphism UI elements, and smooth interactions.
- **Zustand**: Handles local state persistence and engine logic.
- **Electron**: Packages the whole thing into a standalone desktop executable.

## Getting Started

To run the application locally in development mode:

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server alongside Electron:
   ```bash
   npm run electron:start
   ```

3. To build a standalone executable for your machine:
   ```bash
   npm run electron:build
   ```
