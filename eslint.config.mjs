import unusedImports from 'eslint-plugin-unused-imports'
import pluginNext from '@next/eslint-plugin-next'

export default [
  {
    // Ignore all generated Next.js build output
    ignores: ['.next/**/*'],

    plugins: {
      '@next/next': pluginNext,
      'unused-imports': unusedImports
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,

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
