/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#4CAF50',
        'primary-light': '#66BB6A',
        'primary-dark': '#388E3C',
        secondary: '#2196F3',
        'secondary-light': '#42A5F5',
        'secondary-dark': '#1976D2',
        accent: '#FF4081',
        'accent-light': '#FF80AB',
        'accent-dark': '#F50057',
        error: '#F44336',
        'error-light': '#EF5350',
        'error-dark': '#D32F2F',
        success: '#4CAF50',
        'success-light': '#66BB6A',
        'success-dark': '#388E3C',
        warning: '#FFC107',
        'warning-light': '#FFCA28',
        'warning-dark': '#FFA000',
        info: '#2196F3',
        'info-light': '#42A5F5',
        'info-dark': '#1976D2',
      },
      boxShadow: {
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
} 