import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { apicraft } from '@siberiacancode/apicraft'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default apicraft([
  {
    input: path.join(__dirname, 'api.yaml'),
    output: path.join(__dirname, 'src/shared/api/generated'),
    instance: {
      name: 'fetches',
      runtimeInstancePath: './src/shared/api/fetches.ts',
    },
    nameBy: 'path',
    groupBy: 'tags',
    plugins: ['tanstack'],
  },
])
