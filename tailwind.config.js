/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        prompt: ['Prompt', 'sans-serif'],
        noto: ['"Noto Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
}

