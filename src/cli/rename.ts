/// <reference path="../..//types/index.d.ts" />

import _ = require('lodash')
import * as path from 'path'
import * as fs from 'fs-extra'
import * as changeCase from 'change-case'
import { prompt, Question, Answers } from 'inquirer'
import { FileType, LangExt } from '../declare'
import util, { log, LogType, config, ets } from '../util'

export namespace RenameCommand {
  export interface Options {
    /**
     * 相对于路径
     * 如果是controller，则是相对于app/controller的路径
     * 如果是service，则是相对于app/service的路径
     * 果是model，则是相对于app/model的路径
     */
    relPath: string
    newPath: string
  }

  export interface CLIOptions {

  }
}

export class RenameCommand {
  constructor (public options: RenameCommand.Options) {

  }

  async run (name: string) {
    let options: RenameCommand.Options = { relPath: name, newPath: this.options.newPath }

    // 获取 answers
    let answers: RenameAnswers = await getAnswers(options)

    // 字段做容错处理
    let defaults: RenameAnswers = {
      ...options
    }

    answers = _.merge({}, defaults, answers)

    await this.createFile(answers)
  }
  private async createFile (answers: RenameAnswers) {
    let { relPath = '', newPath = '' } = answers
    let oldName = path.basename(relPath)
    let newName = path.basename(newPath)

    let renameData = {
      oldName: changeCase.pascalCase(oldName),
      newName: changeCase.pascalCase(newName)
    }

    let fileTypes: FileType[] = [FileType.Controller, FileType.Service, FileType.Model, FileType.ControllerTest, FileType.ServiceTest]

    let list = fileTypes.map((fileType) => {
      let oldPhycialPath = util.getDestPath(fileType, relPath)
      let newPhycialPath = util.getDestPath(fileType, newPath)
      return {
        // 旧文件路径
        oldPath: oldPhycialPath,
        // 新文件路径
        newPath: newPhycialPath,
        // 文件类型
        fileType: fileType,
        // 旧文件目录
        oldDir: path.dirname(oldPhycialPath),
        // 旧文件名称
        oldName,
        // 新文件目录
        newDir: path.dirname(newPhycialPath),
        // 新文件名称
        newName,
        // 旧文件相对项目根目录的路径
        oldDestRelPath: util.getDestRelativePath(fileType, relPath),
        // 新文件相对项目根目录的路径
        newDestRelPath: util.getDestRelativePath(fileType, newPath)
      }
    })

    let renamed = false

    let promises = list.map(async item => {
      if (fs.existsSync(item.oldPath)) {
        await fs.move(item.oldPath, item.newPath)

        // 目录为空时，删除目录
        if (util.isDirEmpty(item.oldDir)) {
          await fs.remove(item.oldDir)
        }

        // 重写名文件内容
        if (config.renameContent) {
          let data = util.readFile(item.newPath)
          data = data.replace(new RegExp(`${renameData.oldName}`, 'g'), renameData.newName)
          await fs.writeFile(item.newPath, data)
        }

        log.msg(LogType.CHANGE, `${item.fileType} "${item.oldName}" in ${item.oldDestRelPath} renamed to "${item.newName}" in ${item.newDestRelPath}`)

        renamed = true
      }
    })

    try {
      await Promise.all(promises)

      if (!renamed) {
        log.error(`重命名失败，未找路径${relPath}相关的文件`)
      } else {
        // 当扩展名为.ts时，执行egg-ts-helper
        if (config.ext === LangExt.TypeScript) {
          ets()
        }
      }
    } catch (err) {
      log.error(`重命名失败，${err.stack}`)
    }
  }
}

/**
 * 交互式问答
 *
 * @interface NewAnswers
 * @extends {Answers}
 */
interface RenameAnswers extends Answers {
  relPath?: string
  newPath?: string
}

export default {
  name: 'rename [name]',
  usage: '[name]',
  alias: '',
  description: '重命名egg文件',
  on: {},
  options: [
    ['-n, --newPath <new path>', '重命名文件相对路径']
  ],
  async action (name: string, options: RenameCommand.Options) {
    let newCommand = new RenameCommand(options)
    await newCommand.run(name)
  }
}

function getAnswers (options: RenameCommand.Options): Promise<RenameAnswers> {
  let { relPath = '', newPath = '' } = options

  const CREATE_QUESTIONS: Question[] = [
    {
      type: 'input',
      message: '请输入要重命名的文件路径',
      name: 'relPath',
      filter (input: string) {
        return input.trim()
      },
      validate (input: string, answers: any) {
        if (input === '') {
          return '请输入重命名文件路径'
        }
        return true
      },
      when (answers: any) {
        return !relPath && !answers.relPath
      }
    },
    {
      type: 'input',
      message: '请输入新的文件路径',
      name: 'newPath',
      filter (input: string) {
        return input.trim()
      },
      validate (input: string, answers: any) {
        if (input === '') {
          return '请输入新文件路径'
        }
        return true
      },
      when (answers: any) {
        return !newPath && !answers.newPath
      }
    }
  ]

  return prompt(CREATE_QUESTIONS)
}
