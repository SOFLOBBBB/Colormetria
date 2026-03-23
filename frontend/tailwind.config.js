/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        primavera: { light: '#FFF5E6', DEFAULT: '#FF7F50', dark: '#E65100' },
        verano: { light: '#F3E5F5', DEFAULT: '#9C27B0', dark: '#6A1B9A' },
        otono: { light: '#FBE9E7', DEFAULT: '#E65100', dark: '#BF360C' },
        invierno: { light: '#E3F2FD', DEFAULT: '#1565C0', dark: '#0D47A1' },
      },
      borderRadius: {
        app: '1rem',
        'app-lg': '1.25rem',
        'app-xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 8px 32px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255,255,255,0.06) inset',
        elevated: '0 24px 56px rgba(0, 0, 0, 0.45), 0 12px 24px rgba(0, 0, 0, 0.22)',
        glow: '0 0 48px rgba(139, 111, 158, 0.28)',
        'glow-soft': '0 0 60px rgba(196, 165, 132, 0.15)',
      },
      transitionDuration: {
        ui: '220ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.55s cubic-bezier(0.22,1,0.36,1)',
        'slide-up': 'slideUp 0.55s cubic-bezier(0.22,1,0.36,1)',
        'pulse-slow': 'pulse 3s infinite',
        'shimmer-slow': 'shimmerSlow 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmerSlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.75' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-subtle':
          'linear-gradient(135deg, rgba(196,165,132,0.08) 0%, transparent 50%), linear-gradient(225deg, rgba(139,111,158,0.08) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
