/** @type {import('tailwindcss').Config} */
module.exports = {
  // Garanta que o caminho do seu layout esteja aqui
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF6B35',
          secondary: '#1A1A2E',
          accent: '#F7C59F',
          success: '#4CAF50',
          warning: '#FFC107',
          danger: '#F44336',
          background: '#0F0F1A',
          surface: '#1E1E30',
          'surface-2': '#2A2A3E',
          'text-primary': '#FFFFFF',
          'text-secondary': '#A0A0B8',
          'text-muted': '#606078',
        },
      },
    },
  },
  plugins: [],
};
