/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#101216',
          panel: '#171A20',
          secondary: '#1D2129',
          control: '#252A34',
          hover: '#303744',
          border: '#343B48',
        },
        text: {
          main: '#F0F2F5',
          secondary: '#A8AFBA',
        },
        accent: {
          DEFAULT: '#4D8DFF',
          error: '#FF5A67',
          success: '#43C98B',
        }
      },
    },
  },
  plugins: [],
}
