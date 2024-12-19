import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'course-row-pop-in': {
          from: {
            transform: 'translateY(-15px)',
            backgroundColor: 'bg-base-300',
          },
          to: {
            transform: 'translateY(0)',
            backgroundColor: 'bg-base-200',
          },
        },
      },
      animation: {
        'course-row-pop-in': 'course-row-pop-in 0.1s ease-out',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    logs: false,
    themes: ['dark'],
  },
};
