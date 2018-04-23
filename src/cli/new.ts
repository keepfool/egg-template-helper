/// <reference path="../..//types/index.d.ts" />

import _ = require('lodash')
import * as path from 'path'
import * as fs from 'fs-extra'
import * as memFs from 'mem-fs'
import * as editor from 'mem-fs-editor'
import * as changeCase from 'change-case'
import { prompt, Question, Answers } from 'inquirer'
import { NewType, FileType } from '../declare'
import util, { log, LogType, config, ets } from '../util'
import { LangExt } from '../declare'

export namespace NewCommand {
  export interface Options {
    category: string
    /**
     * 相对于路径
     * 如果是controller，则是相对于app/controller的路径
     * 如果是service，则是相对于app/service的路径
     * 果是model，则是相对于app/model的路径
     */
    relPath: string
    data?: string
    test?: boolean
  }

  export interface CLIOptions {

  }
}

export class NewCommand {
  constructor (public options: NewCommand.Options) {

  }

  async run (name: string) {
    let options: NewCommand.Options = { category: this.options.category, test: this.options.test, relPath: name }
    // 获取 answers
    let answers: NewAnswers = await getAnswers(options)

    // 字段做容错处理
    let defaults: NewAnswers = {
      ...options,
      data: '{}'
    }

    answers = _.merge({}, defaults, answers)

    await this.createFile(answers)
  }
  private async createFile (answers: NewAnswers) {
    let { category, relPath = '', data, test } = answers
    let name = path.basename(relPath)

    // 合并自定义数据
    let _customData = _.merge({}, config.customData, eval(`(${data})`))

    // 向上查找的初始层级为3
    let modelTestLevel = 3
    modelTestLevel += relPath.split('/').length - 1

    let modelTestRootRelative = '../'.repeat(modelTestLevel)

    let newData = {
      name: name,
      pascalCaseName: changeCase.pascalCase(name),
      testName: relPath,
      modelTestRootRelative,
      ..._customData
    }

    let fileTypes: FileType[] = []

    switch (category) {
      case NewType.Default:
        fileTypes = [FileType.Controller, FileType.Service, FileType.Model]
        if (test) {
          fileTypes = fileTypes.concat([FileType.ControllerTest, FileType.ServiceTest, FileType.ModelTest])
        }
        break
      case NewType.Controller:
        fileTypes = [FileType.Controller]
        if (test) {
          fileTypes.push(FileType.ControllerTest)
        }
        break
      case NewType.Service:
        fileTypes = [FileType.Service]
        if (test) {
          fileTypes.push(FileType.ServiceTest)
        }
        break
      case NewType.Model:
        fileTypes = [FileType.Model]
        if (test) {
          fileTypes.push(FileType.ModelTest)
        }
        break
    }

    // 内存编辑器
    const store = memFs.create()
    const fsEditor = editor.create(store)

    let tpls = fileTypes.map((fileType) => {
      return {
        oPath: util.getTemplatePath(fileType),
        tPath: util.getDestPath(fileType, relPath),
        content: newData,
        // 文件类型
        fileType: fileType,
        // 文件相对路径
        relPath: relPath,
        // 文件的basename
        name: name,
        // 相对项目根目录的路径
        destRelPath: util.getDestRelativePath(fileType, relPath)
      }
    })

    for (let tpl of tpls) {
      if (fs.existsSync(tpl.tPath)) {
        log.error(`创建失败，因为文件 "${tpl.tPath}" 已经存在`)
        return
      }
      fsEditor.copyTpl(tpl.oPath, tpl.tPath, tpl.content)
    }

    return new Promise((resolve, reject) => {
      // 提交编辑器信息
      fsEditor.commit(() => {
        log.newline()

        tpls.forEach((tpl) => {
          log.output(LogType.CREATE, `${tpl.fileType} "${tpl.name}"`, `${tpl.destRelPath}`)
          log.msg(LogType.COMPLETE, `${tpl.fileType} "${tpl.name}" 创建完成`)
        })

        // 当扩展名为.ts时，执行egg-ts-helper
        if (config.ext === LangExt.TypeScript) {
          ets()
        }

        resolve()
      })
    })
  }
}

/**
 * 交互式问答
 *
 * @interface NewAnswers
 * @extends {Answers}
 */
interface NewAnswers extends Answers {
  category?: string
  relPath?: string
}

export default {
  name: 'new [name]',
  usage: '[name]',
  alias: '',
  description: '新建egg文件',
  on: {},
  options: [
    ['-c, --category <category>', '新建类型'],
    ['-t, --test', '是否创建测试'],
    ['-d, --data <data>', '自定义数据']
  ],
  async action (name: string, options: NewCommand.Options) {
    let newCommand = new NewCommand(options)
    await newCommand.run(name)
  }
}

function getAnswers (options: NewCommand.Options): Promise<NewAnswers> {
  let { category = '', relPath = '' } = options

  const CREATE_QUESTIONS: Question[] = [
    {
      type: 'list',
      message: '请选择新建类型',
      name: 'category',
      choices: () => {
        return [{
          name: '默认模式',
          value: NewType.Default
        }, {
          name: '新建model',
          value: NewType.Model
        }, {
          name: '新建controller',
          value: NewType.Controller
        }, {
          name: '新建service',
          value: NewType.Service
        }]
      },
      when (answers: any) {
        return !category
      }
    }, {
      type: 'input',
      message: '请设置文件路径',
      name: 'relPath',
      filter (input: string) {
        return input.trim()
      },
      validate (input: string, answers: any) {
        if (input === '') {
          return '请输入文件路径'
        }
        return true
      },
      when (answers: any) {
        return !relPath && !answers.relPath
      }
    }
  ]

  return prompt(CREATE_QUESTIONS)
}
