# LibreStory Agent Directives

You are an expert frontend engineer specializing in building high-performance, immersive desktop applications using Tauri/Electron, React/Tailwind, and modern CSS/Framer Motion. 

We are building "LibreStory"—a local-first, open-core, premium text adventure client compatible with AI Dungeon JSON exports and Bring-Your-Own-Key (BYOK) architectures.

## Architectural Rules
1. **No Automated Account Scraping:** The app is a passive parser. All importing must happen via local manual drag-and-drop or file upload of `.json` data. Never write scrapers or automated login flows for third-party platforms.
2. **Clean Room Implementation:** Write all code from scratch. Do not reference or copy legacy 2019 AI Dungeon source code. Use standard open-source UI icon sets (like Lucide-react).
3. **Data Security:** Ensure user API keys (OpenRouter, Gemini, OpenAI, Anthropic) are stored securely in local state/config files, never leaked to logs, and masked cleanly when displayed.

## UI & Styling Guidelines
1. **The Theme:** Deep, immersive dark mode with rich ambient background radial gradients (blues, purples, dark greys).
2. **Glassmorphism:** Use translucent background panels for cards, the header, and main containers. Implement smooth blurs (`backdrop-filter: blur(12px)`), thin semi-transparent borders (`rgba(255,255,255,0.05)`), and soft drop shadows.
3. **Neumorphism:** Apply subtle neumorphic extrusions for physical interactive elements, settings inputs, and toggle pills, making them look tactile.
4. **Typography:** Story text must be locked to a readable max-width of `65ch` to `70ch`, with a `line-height` of `1.65`, and use a high-legibility off-white/silver color (e.g., `#E2E8F0`) to eliminate eye strain.
5. **Layout Flow:** Keep the player's focus tight. Dynamic action buttons or input fields must sit directly below the last line of story text rather than being permanently locked to the bottom browser edge.

When writing or refactoring code, maintain clean state management, modular components, and prioritize smooth UX animations.
