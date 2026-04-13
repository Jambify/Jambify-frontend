import type { Config } from 'tailwindcss'

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        
      colors: {
        brand: {
          DEFAULT: '#5B3BFF',
          light: '#7B5FFF',
          dim: 'rgba(91,59,255,0.12)',
        },
        success: {
          DEFAULT: '#00C896',
          dim: 'rgba(0,200,150,0.12)',
        },
        danger: {
          DEFAULT: '#FF4D6D',
          dim: 'rgba(255,77,109,0.12)',
        },
        warn: {
          DEFAULT: '#FFB020',
          dim: 'rgba(255,176,32,0.12)',
        },
        bgMain: '#0A0A0F',
        bgSurface: '#111118',
        bgCard: '#18181F',
        borderMuted: 'rgba(255,255,255,0.07)',
        textMain: '#F0EFF8',
        textMuted: '#9896B0',
        textDim: '#5C5A72',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        'brand': '12px',
        'brand-lg': '18px',
        'brand-xl': '24px',
      }
    },
  },
  plugins: [],
} satisfies Config