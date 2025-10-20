# Chatbot (React + Vite)

Brief instructions to run the project locally.

Prerequisites
- Node.js 16+ (or current LTS)
- npm or yarn

Install
1. Open a terminal and go to project folder:
   cd "\chatbot"
2. Install dependencies:
   npm install
   (or `yarn`)

Environment
- Create a `.env` file in the project root (same folder as package.json).
- Add the following variables (replace with your values):
```
VITE_DIFY_API_URL=https://api.dify.example/endpoint
VITE_DIFY_API_KEY=your_api_key_here
```

Run (development)
- Start dev server (Vite):
  npm run dev
  (or `yarn dev`)
- Open the URL printed by Vite (usually http://localhost:5173).

Build / Preview
- Build:
  npm run build
  (or `yarn build`)
- Preview production build:
  npm run preview
  (or `yarn preview`)

Notes
- The app uses Tailwind CSS. If styles are missing ensure `index.css` is imported (already added) and Tailwind is configured in the project.
- The chat uses Dify streaming API — ensure `VITE_DIFY_API_URL` and `VITE_DIFY_API_KEY` are correct.
- Logo: put your logo image in `public/BPJS_Kesehatan_logo.png` or change the path in `src/Pages/ChatInterface.jsx`.

Troubleshooting
- White flash / scrollbar issues: root/background color is set in `src/index.css`.
- If the streaming API fails, check network console and that API key is valid.

That's it — run the dev server and test the chat UI.