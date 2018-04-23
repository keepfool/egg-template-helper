import * as path from 'path'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import { config } from '../util'
import { FileType } from '../declare'

export type MPath = string | path.ParsedPath

export function getModifiedTime (mpath: MPath): number {
  let spath = pathToString(mpath)
  return isFile(spath) ? +fs.statSync(spath).mtime : 0
}

export function pathToString (mpath: MPath): string {
  if (!_.isString(mpath)) {
    return path.join(mpath.dir, mpath.base)
  }
  return mpath
}

export function pathToParse (mpath: MPath): path.ParsedPath {
  if (_.isString(mpath)) {
    return path.parse(mpath)
  }
  return mpath
}

export function isFile (mpath: MPath): boolean {
  let spath = pathToString(mpath)

  if (!fs.existsSync(spath)) return false

  return fs.statSync(spath).isFile()
}

export function isDir (mpath: MPath): boolean {
  let spath = pathToString(mpath)

  if (!fs.existsSync(spath)) return false

  return fs.statSync(spath).isDirectory()
}

export function isDirEmpty (dirname: string): boolean {
  let list = fs.readdirSync(dirname)
  return list.length === 0
}

export function unlink (mpath: MPath) {
  let spath = pathToString(mpath)
  try {
    fs.unlinkSync(spath)
    return true
  } catch (e) {
    return e
  }
}

export function readFile (mpath: MPath): string {
  let spath = pathToString(mpath)
  let rst = ''
  try {
    rst = fs.readFileSync(spath, 'utf-8')
  } catch (e) {
    rst = ''
  }
  return rst
}

export function writeFile (mpath: MPath, data: string) {
  let ppath = pathToParse(mpath)
  let spath = pathToString(mpath)

  if (!this.isDir(ppath.dir)) {
    fs.ensureDirSync(ppath.dir)
  }
  fs.writeFileSync(spath, data)
}

export function copyFile (srcFilePath: string, destFilePath: string) {
  let destDirPath = path.dirname(destFilePath)
  if (!this.isDir(destDirPath)) {
    fs.ensureDirSync(destDirPath)
  }
  fs.copySync(srcFilePath, destFilePath)
}

/**
 * 获取脚手架模板的路径
 *
 */
export function getTemplatePath (fileType: FileType) {
  let tplPath = ''

  const defaultTplPath = path.join(__dirname, `../../template`, config.ext.substring(1), `${fileType}.tpl`)

  if (config.templateDir) {
    tplPath = path.join(config.cwd, config.templateDir, `${fileType}.tpl`)
  }

  if (!fs.existsSync(tplPath)) {
    tplPath = defaultTplPath
  }

  return tplPath
}

/**
 * 获取相对工程根目录的路径
 *
 */
export function getDestRelativePath (fileType: FileType, relPath: string) {
  let isTest = fileType === FileType.ControllerTest || fileType === FileType.ServiceTest
  let dir = isTest ? 'test/app' : 'app'
  dir += `/${fileType.split('.')[0]}`

  let subDir = path.dirname(relPath)

  if (subDir !== '.') {
    dir += `/${subDir}`
  }
  return dir
}

export function getDestPath (fileType: FileType, relPath: string) {
  let isTest = fileType === FileType.ControllerTest || fileType === FileType.ServiceTest
  let dir = isTest ? 'test/app' : 'app'
  let fileName = isTest ? `${relPath}.test${config.ext}` : `${relPath}${config.ext}`
  return path.join(config.cwd, `${dir}/${fileType.split('.')[0]}`, fileName)
}
