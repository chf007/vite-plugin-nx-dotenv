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
