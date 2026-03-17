/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular', 'System'],
        medium: ['Inter_500Medium', 'System'],
        semibold: ['Inter_600SemiBold', 'System'],
        bold: ['Inter_700Bold', 'System'],
      },
      colors: {
        slate: {
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        primary: {
          DEFAULT: '#3B82F6',
          glow: 'rgba(59, 130, 246, 0.3)',
        }
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
