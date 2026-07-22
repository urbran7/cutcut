# NovaCut Web Lite

Lightweight browser-based video editor for recap videos.

## Project Purpose

NovaCut Web Lite is a lightweight browser-based video editor designed specifically for:
- Movie recap videos
- Documentary recap videos
- Voice-over videos
- Simple YouTube videos
- Narration-based content

All media processing happens locally in the browser. No files are uploaded to any server.

## Required Node.js Version

Node.js 18.x or higher is required.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Type Check

```bash
npm run typecheck
```

## Tests

Run tests in watch mode:
```bash
npm run test
```

Run tests once and exit:
```bash
npm run test:run
```

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Step 1 Limitations

This is Step 1 of the development process. Current limitations:

- No project creation functionality yet (button is disabled)
- No media import functionality yet (button is disabled)
- No timeline editor yet
- No preview playback yet
- No FFmpeg WebAssembly integration yet
- Only a startup screen with placeholder buttons is displayed
- The application displays "Project foundation ready" status

Future steps will add:
- Project management
- Media import and management
- Timeline editing
- Video preview and playback
- Export functionality
