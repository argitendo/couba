/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'mainColor': {
          'primary': '#6663FD',
          'secondary': '#CFFF5E',
          'tertiary': '#1B1F3A',
          'cream': '#FDF7E7',
        },
        'gradientColor': {
          'primary': {
            'start': '#9C24C6F5',
            'end': '#6663FDEB',
          },
          'secondary': {
            'start': '#FFFFFF',
            'middle': '#8E8BFF',
            'middles': '#E7FDE7',
            'end': '#E7FDE7',
          },
        },
      },
    },
  },
  plugins: [],
};
