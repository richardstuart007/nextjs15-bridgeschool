import nextCoreWebVitals from 'eslint-config-next/core-web-vitals.js' // Note the .js extension
import unusedImports from 'eslint-plugin-unused-imports'

export default [
  // Spread the Next.js core-web-vitals rules directly
  ...nextCoreWebVitals,

  {
    plugins: {
      'unused-imports': unusedImports
    },

    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ]
    }
  }
]
