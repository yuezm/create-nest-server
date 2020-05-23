#!/usr/env/bind node

import { success } from 'log-symbols';
import *as chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Command } from 'commander';
import { join } from 'path';

import { effectCompile, ETemplateType, ICompileArgs, INameSerialization, serializePathName } from './util';

const APP_MODULE_PATH = './src/app/app.module.ts';
const APP_IMPORT_REG = /(import.*?)((?=@Global)|(?=@Module))/s;
const APP_MODULE_IMPORTS_REG = /@Module.*?imports.*?(?=])/s;

export interface IGeneratorOptions {
  appPath: string;
  templateList: ETemplateType[];
  moduleName: string;
  isGRpc: boolean;
}

function effectGenerator(options: IGeneratorOptions) {
  const sourceData: ICompileArgs = Object.assign(serializePathName(options.moduleName), { isGRpc: options.isGRpc });

  options.templateList.map(type => effectCompile(type, sourceData, join(options.appPath, options.moduleName)));

  if (existsSync(APP_MODULE_PATH)) {
    // 将该Module加入app.module.ts
    let appStr: string = readFileSync(APP_MODULE_PATH).toString();

    // 避免重复添加

    if (appStr.includes(`import { ${ sourceData.nameHump }Module } from '@App/${ sourceData.name }/${ sourceData.path }.module'`)) {
      console.error(chalk.default.red('模块重复'));
      return;
    }

    // 替换 import
    appStr = appStr.replace(APP_IMPORT_REG, (p: string) => {
      return p + `import { ${ sourceData.nameHump }Module } from '@App/${ options.moduleName }/${ sourceData.path }.module';\n`;
    });

    // 替换imports属性
    appStr = appStr.replace(APP_MODULE_IMPORTS_REG, (p: string) => {
      return p + `\u00A0\u00A0${ sourceData.nameHump }Module,`;
    });

    // 将新的数据写入app.module.ts
    writeFileSync(APP_MODULE_PATH, appStr);
  }
}

export function serveGenerate(name: string, cmd: Command) {
  try {
    let templateList: ETemplateType[] = [];

    // 选择模板
    if (cmd.module) templateList.push(ETemplateType.MODULE);
    if (cmd.controller) templateList.push(ETemplateType.CONTROLLER);
    if (cmd.service) templateList.push(ETemplateType.SERVICE);
    if (cmd.dto) templateList.push(ETemplateType.DTO);
    if (cmd.static) templateList.push(ETemplateType.STATIC);

    // 无选择模板即为所有模板
    if (templateList.length < 1) {
      templateList = [ ETemplateType.MODULE, ETemplateType.CONTROLLER, ETemplateType.SERVICE, ETemplateType.DTO, ETemplateType.STATIC, ETemplateType.SPEC ];
    }

    effectGenerator({
      moduleName: name,
      appPath: cmd.path ?? 'src/app',
      templateList,
      isGRpc: Boolean(cmd.grpc),
    });

    console.log(success, chalk.default.green('already created'));
  } catch (e) {
    console.error(chalk.default.red(e.message));
  }
}

