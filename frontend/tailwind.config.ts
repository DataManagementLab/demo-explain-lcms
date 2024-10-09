/* eslint-disable @typescript-eslint/no-var-requires */
const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@spartan-ng/ui-core/hlm-tailwind-preset')],
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      gridTemplateRows: {
        full: 'minmax(100px, 100%)',
        '60-40': 'minmax(100px, 60%) minmax(100px, 40%)',
      },
      spacing: {
        'line-chart': '600px',
      },
    },
  },
  plugins: [],
};
