/**
 * JSDoc Configuration for Civic Portal
 * Generates comprehensive API documentation
 */

module.exports = {
  source: {
    include: [
      './src/lib/',
      './src/components/',
      './src/hooks/',
      './src/providers/',
      './src/types/',
      './README.md'
    ],
    includePattern: '\\.(js|jsx|ts|tsx)$',
    exclude: [
      './src/**/*.test.{js,jsx,ts,tsx}',
      './src/**/*.spec.{js,jsx,ts,tsx}',
      './src/**/__tests__/',
      './src/test/',
      './src/stories/',
      './node_modules/'
    ]
  },
  opts: {
    destination: './docs/api/',
    recurse: true,
    readme: './README.md'
  },
  plugins: [
    'plugins/markdown',
    'plugins/summarize'
  ],
  templates: {
    cleverLinks: false,
    monospaceLinks: false
  },
  tags: {
    allowUnknownTags: true,
    dictionaries: ['jsdoc', 'closure']
  },
  markdown: {
    parser: 'gfm'
  }
};
