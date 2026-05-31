/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'tablet': '641px',
      'desktop': '1025px',
    },
    extend: {
      colors: {
        primaryBlack: "#1A1A1A",
        accentGold: "#C9A961",
        accentRed: "#B33A3A",
        neutralWhite: "#FFFFFF",
        softGray: "#F5F5F5",
      },
    },
  },
  plugins: [],
};
