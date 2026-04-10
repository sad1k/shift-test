if (!Object.groupBy) {
  Object.groupBy = function groupBy(items, callbackFn) {
    return Array.from(items).reduce((result, item, index) => {
      const key = callbackFn(item, index)
      result[key] ??= []
      result[key].push(item)
      return result
    }, {})
  }
}

const { default: antfu } = await import('@antfu/eslint-config')

export default antfu({
  typescript: true,
  lessOpinionated: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  formatters: {
    css: true,
  },
  ignores: [
    'dist',
    'node_modules',
    'pnpm-lock.yaml',
    'tsconfig.json',
    'eslint.config.mjs',
    'src/shared/api/generated',
  ],
})
