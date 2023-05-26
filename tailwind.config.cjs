module.exports = {
  presets: [require('./dep/frontend/shared/tailwind-base.cjs')],
  mode: 'jit',
  content: [
    'src/**/*.{js,ts,jsx,tsx}',
    'dep/frontend/src/**/*.{js,ts,jsx,tsx}',
  ],
  // Note: Commented out because it leads to error during webpack somehow. Maybe we do not need this anyway?
  // plugins: [require('@tailwindcss/typography')],
  // theme: {
  //   extend: {
  //     typography: {
  //       DEFAULT: {
  //         css: {
  //           code: {
  //             '&:before': {
  //               content: 'normal !important',
  //             },
  //             '&:after': {
  //               content: 'normal !important',
  //             },
  //             'border-radius': '0.125rem',
  //             'background-color': 'rgb(239 247 251)',
  //             padding: '0.25rem',
  //             'font-size': '1rem',
  //             'line-height': '1.5rem',
  //             color: 'rgb(0 126 193)',
  //           },
  //         },
  //       },
  //     },
  //     borderWidth: {
  //       3: '3px',
  //       6: '6px',
  //     },
  //   },
  //   screens: {
  //     mobile: '500px',
  //   },
  // },
}
