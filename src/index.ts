import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type { Plugin, ResolvedConfig } from 'vite';
import { normalizePath } from 'vite';

export const loadNxDotEnv = (mode: string, appEnvDir: string, globalEnvDir: string, prefixes: string | string[] = 'VITE_') => {

    prefixes = arraify(prefixes);
    const env: Record<string, string> = {};
    const envFiles = [
        /** default file */ `.env`,
        /** local file */ `.env.local`,
        /** mode file */ `.env.${mode}`,
        /** mode local file */ `.env.${mode}.local`,
    ];

    const setEnv = (envDir: string) => {
        for (const file of envFiles) {
            const path = lookupFile(envDir, [file], { pathOnly: true, rootDir: envDir });
            if (path) {
                const parsed = dotenv.parse(fs.readFileSync(path));

                // only keys that start with prefix are exposed to client
                for (const [key, value] of Object.entries(parsed)) {
                    if (
                        (prefixes as string[]).some((prefix) => key.startsWith(prefix))
                    ) {
                        env[key] = value;
                    }
                }
            }
        }
    };

    setEnv(appEnvDir);

    setEnv(globalEnvDir);

    return env;
};

export interface NxDotEnvSupportOptions {
    globalEnvDir: string;
}

export const nxDotEnvSupport = (options: NxDotEnvSupportOptions) => {

    return {
        name: 'vite-plugin-nx-dotenv',

        configResolved(resolvedConfig) {
            const appEnvDir = resolvedConfig.envDir
                ? normalizePath(path.resolve(resolvedConfig.root, resolvedConfig.envDir))
                : resolvedConfig.root;
            const nxDotEnv = loadNxDotEnv(resolvedConfig.mode, appEnvDir, options.globalEnvDir, resolveEnvPrefix(resolvedConfig));

            for (const [key, value] of Object.entries(nxDotEnv)) {
                resolvedConfig.env[key] = value;
            }
        },
    } as Plugin;
};

interface LookupFileOptions {
    pathOnly?: boolean
    rootDir?: string
}

function lookupFile(
    dir: string,
    formats: string[],
    options?: LookupFileOptions
): string | undefined {
    for (const format of formats) {
        const fullPath = path.join(dir, format);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            return options?.pathOnly ? fullPath : fs.readFileSync(fullPath, 'utf-8');
        }
    }
    const parentDir = path.dirname(dir);
    if (
        parentDir !== dir &&
        (!options?.rootDir || parentDir.startsWith(options?.rootDir))
    ) {
        return lookupFile(parentDir, formats, options);
    }
}

function arraify<T>(target: T | T[]): T[] {
    return Array.isArray(target) ? target : [target];
}

function resolveEnvPrefix({
                              envPrefix = 'VITE_'
                          }: ResolvedConfig): string[] {
    envPrefix = arraify(envPrefix);
    if (envPrefix.some((prefix) => prefix === '')) {
        throw new Error(
            `envPrefix option contains value '', which could lead unexpected exposure of sensitive information.`
        );
    }
    return envPrefix;
}
