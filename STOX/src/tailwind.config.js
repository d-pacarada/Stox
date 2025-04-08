// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}"  // ← if using Next.js style
  ],
  theme: {
    extend: {
      colors: {
        darkBlue: '#0d274b',
        linkOrange: '#ff9900',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    }    
  },
  plugins: [],
};
