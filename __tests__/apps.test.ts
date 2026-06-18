import { expect, test, describe } from "bun:test";
import { appInfoSchema, dynamicComposeSchema } from '@runtipi/common/schemas'
import { fromError } from 'zod-validation-error';
import fs from 'node:fs'
import path from 'node:path'
import { type } from "arktype";

const getApps = async () => {
  const appsDir = await fs.promises.readdir(path.join(process.cwd(), 'apps'))

  const appDirs = appsDir.filter((app) => {
    const stat = fs.statSync(path.join(process.cwd(), 'apps', app))
    return stat.isDirectory()
  })

  return appDirs
};

const getFile = async (app: string, file: string) => {
  const filePath = path.join(process.cwd(), 'apps', app, file)
  try {
    const file = await fs.promises.readFile(filePath, 'utf-8')
    return file
  } catch (err) {
    return null
  }
}

// 1. Defina as variantes aceitas no topo ou antes do laço
const composeCandidates = ['docker-compose.json', 'docker-compose.yml', 'docker-compose.yaml'];

// 2. No laço que testa a existência dos arquivos, altere a lógica do docker-compose:
for (const file of ['config.json', 'docker-compose.json', 'metadata/logo.jpg', 'metadata/description.md']) {
  test(`app ${app} should have ${file}`, async () => {
    
    // Se o teste for do docker-compose, valida se pelo menos uma das extensões existe
    const fileContent =
      file === 'docker-compose.json'
        ? await (async () => {
            for (const name of composeCandidates) {
              const content = await getFile(app, name);
              if (content !== null) return content;
            }
            return null;
          })()
        : await getFile(app, file);

    expect(fileContent).not.toBeNull();
  });
}

describe("each app should have a valid config.json", async () => {
  const apps = await getApps()

  for (const app of apps) {
    test(`app ${app} should have a valid config.json`, async () => {
      const fileContent = await getFile(app, 'config.json')
      const parsed = appInfoSchema.omit('urn')(JSON.parse(fileContent || '{}'))

      if (parsed instanceof type.errors) {
        const validationError = fromError(parsed);
        console.error(`Error parsing config.json for app ${app}:`, validationError.toString());
      }

      expect(parsed instanceof type.errors).toBe(false)
    })
  }
})

describe("each app should have a valid docker-compose.json", async () => {
  const apps = await getApps()

  for (const app of apps) {
    test(`app ${app} should have a valid docker-compose.json`, async () => {
      const fileContent = await getFile(app, 'docker-compose.json')
      const parsed = dynamicComposeSchema(JSON.parse(fileContent || '{}'))

      if (parsed instanceof type.errors) {
        const validationError = fromError(parsed);
        console.error(`Error parsing docker-compose.json for app ${app}:`, validationError.toString());
      }

      expect(parsed instanceof type.errors).toBe(false)
    })
  }
});
