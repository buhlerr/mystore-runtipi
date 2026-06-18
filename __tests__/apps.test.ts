import { expect, test, describe } from "bun:test";
import { appInfoSchema, dynamicComposeSchema } from '@runtipi/common/schemas';
import fs from 'node:fs';
import path from 'node:path';
import { type } from "arktype";

const getApps = async () => {
  const appsDir = await fs.promises.readdir(path.join(process.cwd(), 'apps'));

  const appDirs = appsDir.filter((app) => {
    const stat = fs.statSync(path.join(process.cwd(), 'apps', app));
    return stat.isDirectory();
  });

  return appDirs;
};

const getFile = async (app: string, file: string) => {
  const filePath = path.join(process.cwd(), 'apps', app, file);
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return fileContent;
  } catch (err) {
    return null;
  }
};

const composeCandidates = ['docker-compose.json', 'docker-compose.yml', 'docker-compose.yaml'];

describe("App Store Files Presence", async () => {
  const apps = await getApps();

  for (const app of apps) {
    for (const file of ['config.json', 'docker-compose.json', 'metadata/logo.jpg', 'metadata/description.md']) {
      test(`app ${app} should have ${file}`, async () => {
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
  }
});

describe("each app should have a valid config.json", async () => {
  const apps = await getApps();

  for (const app of apps) {
    test(`app ${app} should have a valid config.json`, async () => {
      const fileContent = await getFile(app, 'config.json');
      const parsed = appInfoSchema.omit('urn')(JSON.parse(fileContent || '{}'));

      if (parsed instanceof type.errors) {
        console.error(`Error parsing config.json for app ${app}:`, parsed);
        if (typeof (parsed as any).toString === 'function') {
          console.error((parsed as any).toString());
        } else {
          console.error(JSON.stringify(parsed, null, 2));
        }
      }

      expect(parsed instanceof type.errors).toBe(false);
    });
  }
});

describe("each app should have a valid docker-compose", async () => {
  const apps = await getApps();

  for (const app of apps) {
    test(`app ${app} should have a valid docker-compose file`, async () => {
      // Tenta obter qualquer uma das extensões de compose válidas
      let fileContent = null;
      for (const name of composeCandidates) {
        fileContent = await getFile(app, name);
        if (fileContent !== null) break;
      }

      const parsed = dynamicComposeSchema(JSON.parse(fileContent || '{}'));

      if (parsed instanceof type.errors) {
        console.error(`Error parsing docker-compose for app ${app}:`, parsed);
        if (typeof (parsed as any).toString === 'function') {
          console.error((parsed as any).toString());
        } else {
          console.error(JSON.stringify(parsed, null, 2));
        }
      }

      expect(parsed instanceof type.errors).toBe(false);
    });
  }
});
