# vite-plugin-nx-dotenv

Support Vite's [mode] mode of dotenv usage in Nx, according to the following priorities [[issue](https://github.com/ZachJW34/nx-plus/issues/239)] :

1. /apps/[app]/.env.[mode].local
2. /apps/[app]/.env.[mode]
3. /apps/[app]/.env.local
4. /apps/[app]/.env
5. /.env.[mode].local
6. /.env.[mode]
7. /.env.local
8. /.env

> There is a little limitation in use. If the environment variable passed in through the command line is defined in .env, it will be overwritten by the one in .env. According to normal logic, the command line should have the highest priority.
> 
> However, this usage is rare, and it is generally only used during temporary debugging, so it has little impact.

## Getting Started

### Install Plugin

```shell
# npm
npm install vite-plugin-nx-dotenv --save-dev

# yarn
yarn add vite-plugin-nx-dotenv --dev
```

### <WorkspaceRoot>/vite.base.config.ts

```typescript
import { join } from 'path';
import { ConfigEnv, UserConfigExport, Plugin } from 'vite';
import { workspaceRoot } from '@nrwl/tao/src/utils/app-root';

import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { createHtmlPlugin } from 'vite-plugin-html';

import { nxDotEnvSupport } from 'vite-plugin-nx-dotenv';

// https://vitejs.dev/config/
export const viteBaseConfig = async ({ command, mode }: ConfigEnv, nxDotEnv: any) => {

  // 配置项
  const config: UserConfigExport = {
    plugins: [
      nxDotEnvSupport({
        globalEnvDir: workspaceRoot,
      }),
      vue(),
      vueJsx(),
      VueSetupExtend(),
      createHtmlPlugin({
        inject: {
          data: {
            CURRENT_ENV: mode,
            MOCK_ID: nxDotEnv.VITE_MOCK_ID,
          },
        },
      }),
    ],
  };

  config.base = './';

  return config;
};

```

### <WorkspaceRoot>/apps/xxx/vite.config.ts

```typescript
import { defineConfig } from 'vite';
import { workspaceRoot } from '@nrwl/tao/src/utils/app-root';
import { viteBaseConfig } from '../../vite.base.config';
import { loadNxDotEnv } from 'vite-plugin-nx-dotenv';
import _ from 'lodash';

// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode }) => {

    const nxDotEnv = loadNxDotEnv(mode, __dirname, workspaceRoot);

    return _.merge(
        {
            root: __dirname,
            build: {
                outDir: '../../dist/apps/xxx',
                emptyOutDir: true,
            },
            server: {
                port: 4000,
                open: `/demo?id=${nxDotEnv.VITE_MOCK_ID}`,
            },
        },
        await viteBaseConfig({ command, mode }, nxDotEnv),
    );
});


```

