/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F3F5F2",
        card: "#FBFCFA",
        ink: "#16231F",
        muted: "#5B6B65",
        line: "#D9DFDA",
        forest: { DEFAULT: "#1E5B4B", dark: "#164236", tint: "#E1EEE9" },
        saffron: { DEFAULT: "#B9770E", tint: "#F8EBD2" },
        brick: { DEFAULT: "#A93B2F", tint: "#F6E0DC" },
      },
      fontFamily: {
        sans: ['"Public Sans"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Newsreader", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
