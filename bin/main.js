#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const packageJson = require('../package');
const nest_serve_new_1 = require("./nest-serve-new");
const nest_serve_generate_1 = require("./nest-serve-generate");
commander_1.version(packageJson.version).usage('<command> [options]');
commander_1.command('new <app-name> [repository-path]')
    .alias('n')
    .option('--http', '创建HTTP 服务')
    .option('--micro', '创建微服务，默认gRPC')
    .description('创建新的项目,如果输入为"."，则为当前目录')
    .action((name, repositoryPath, cmd) => {
    nest_serve_new_1.serveNew(name, repositoryPath, cmd);
});
commander_1.command('generate <name>')
    .alias('g')
    .option('-m,--module', '只创建 *.module.ts')
    .option('-c,--controller', '只创建 *.controller.ts')
    .option('-s,--service', '只创建 *.service.ts')
    .option('-o,--dto', '只创建 *.dto.ts')
    .option('-t,--static', '只创建 *.static.ts')
    .option('-p,--path,', '选择创建模块路径，默认为 src/app')
    .description('在当前项目创建模块，包括module、controller、service...，并添加到AppModule')
    .action((name, cmd) => {
    nest_serve_generate_1.serveGenerate(name, cmd);
});
if (commander_1.parse(process.argv).args.length < 1) {
    commander_1.help();
}
