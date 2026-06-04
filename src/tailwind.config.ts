import type { Config } from 'tailwindcss'

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5B3BFF',
          light:   '#7B5FFF',
          dim:     'rgba(91,59,255,0.12)',
        },
        success: {
          DEFAULT: '#00C896',
          dim:     'rgba(0,200,150,0.12)',
        },
        danger: {
          DEFAULT: '#FF4D6D',
          dim:     'rgba(255,77,109,0.12)',
        },
        warn: {
          DEFAULT: '#FFB020',
          dim:     'rgba(255,176,32,0.12)',
        },

        /* ── Backgrounds ─────────────────────────── */
        bg:        '#0A0A0F',   /* page root — used in Topbar backdrop      */
        bgDeep:    '#070709',   /* sidebar background                      */
        bgMain:    '#0A0A0F',   /* alias kept for backwards compat         */
        bgSurface: '#111118',   /* nav items, input backgrounds            */
        bgCard:    '#18181F',   /* cards, panels                           */

        /* ── Borders ─────────────────────────────── */
        borderMuted: 'rgba(255,255,255,0.07)',

        /* ── Text ────────────────────────────────── */
        textMain:  '#F0EFF8',
        textMuted: '#9896B0',
        textDim:   '#5C5A72',
      },

      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },

      borderRadius: {
        brand:    '12px',
        'brand-lg': '18px',
        'brand-xl': '24px',
      },

      /* ── Animations ──────────────────────────── */
      animation: {
        fadeIn:    'fadeIn 0.25s ease both',
        slideDown: 'slideDown 0.2s ease both',
        spin:      'spin 0.75s linear infinite',
        pulse:     'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)'   },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1'    },
          '50%':       { opacity: '.5'   },
        },
      },

      /* ── Box shadows ─────────────────────────── */
      boxShadow: {
        brand:   '0 4px 24px rgba(91,59,255,0.35)',
        success: '0 4px 16px rgba(0,200,150,0.25)',
        danger:  '0 4px 16px rgba(255,77,109,0.25)',
        card:    '0 4px 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config
