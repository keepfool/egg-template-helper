/// <reference path="../..//types/index.d.ts" />

import _ = require('lodash')
import * as path from 'path'
import * as fs from 'fs-extra'
import { prompt, Question, Answers } from 'inquirer'
import { FileType, LangExt } from '../declare'
import util, { log, LogType, config, ets } from '../util'

export namespace DeleteCommand {
  export interface Options {
    /**
     * 相对于路径
     * 如果是controller，则是相对于app/controller的路径
     * 如果是service，则是相对于app/service的路径
     * 果是model，则是相对于app/model的路径
     */
    relPath: string
  }

  export interface CLIOptions {

  }
}

export class DeleteCommand {
  constructor (public options: DeleteCommand.Options) {

  }

  async run (name: string) {
    let options: DeleteCommand.Options = { relPath: name }

    // 获取 answers
    let answers: DeleteAnswers = await getAnswers(options)

    // 字段做容错处理
    let defaults: DeleteAnswers = {
      ...options
    }

    answers = _.merge({}, defaults, answers)

    await this.createFile(answers)
  }
  private async createFile (answers: DeleteAnswers) {
    let relPath = answers.relPath || ''
    let name = path.basename(relPath)

    let fileTypes: FileType[] = [FileType.Controller, FileType.Service, FileType.Model, FileType.ControllerTest, FileType.ServiceTest]
    let list = fileTypes.map((fileType) => {
      let phycialPath = util.getDestPath(fileType, relPath)
      return {
        path: phycialPath,
        dir: path.dirname(phycialPath),
        // 文件类型
        fileType: fileType,
        // 文件的basename
        name: name,
        // 相对项目根目录的路径
        destRelPath: util.getDestRelativePath(fileType, relPath)
      }
    })

    let deleted = false

    let promises = list.map(async item => {
      if (fs.existsSync(item.path)) {
        await fs.remove(item.path)
        // 目录为空时，删除目录
        if (util.isDirEmpty(item.dir)) {
          await fs.remove(item.dir)
        }
        log.output(LogType.DELETE, `${item.fileType} "${item.name}"`, `${item.destRelPath}`)

        deleted = true
      }
    })

    try {
      await Promise.all(promises)

      if (!deleted) {
        log.error(`删除失败，未找路径${relPath}相关的文件`)
      } else {
        // 当扩展名为.ts时，执行egg-ts-helper
        if (config.ext === LangExt.TypeScript) {
          ets()
        }
      }
    } catch (err) {
      log.error(`删除失败，${err.stack}`)
    }
  }
}

/**
 * 交互式问答
 *
 * @interface DeleteAnswers
 * @extends {Answers}
 */
interface DeleteAnswers extends Answers {
  relPath?: string
}

export default {
  name: 'delete [name]',
  usage: '[name]',
  alias: '',
  description: '删除egg文件',
  on: {},
  options: [
  ],
  async action (name: string, options: DeleteCommand.Options) {
    let deleteCommand = new DeleteCommand(options)
    await deleteCommand.run(name)
  }
}

function getAnswers (options: DeleteCommand.Options): Promise<DeleteAnswers> {
  let { relPath = '' } = options

  const CREATE_QUESTIONS: Question[] = [
    {
      type: 'input',
      message: '请输入文件路径',
      name: 'relPath',
      filter (input: string) {
        return input.trim()
      },
      validate (input: string, answers: any) {
        if (input === '') {
          return '请输入文件名称'
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
