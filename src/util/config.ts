import * as fs from 'fs-extra'
import * as path from 'path'
import * as _ from 'lodash'
import { Config, CustomConfig } from '../declare'
import systemConfig from '../config'

/**
 * 自定义配置白名单成员
 */
const CUSTOM_CONFIG_MEMBER: string[] = [
  'ext',
  'templateDir',
  'execEts',
  'customData',
  'renameContent'
]

/**
 * 自定义配置文件路径
 */
function getCustomConfigFilePath (cwd: string = systemConfig.cwd): string {
  return path.join(cwd, systemConfig.filename)
}

/**
 * 获取自定义配置
 */
function getCustomConfig (cwd: string = systemConfig.cwd): { [key: string]: CustomConfig } {
  const filePath = getCustomConfigFilePath(cwd)

  let customConfigFromFile: CustomConfig = {} // for eth.config.json

  // in eth.config.json
  if (fs.existsSync(filePath)) {
    customConfigFromFile = _.pick(fs.readJsonSync(filePath), CUSTOM_CONFIG_MEMBER) as CustomConfig
  }

  // merge customConfigFromFile
  let customConfig = _.merge({}, customConfigFromFile)

  return {
    customConfig
  }
}

/**
 * 配置转换函数
 * @param defaultConfig 默认配置
 * @param customConfig 自定义配置
 */
function convertConfig (defaultConfig: Config, customConfig: CustomConfig = {}) {
  // merge defaultConfig and customConfig
  let config = _.merge({}, defaultConfig, customConfig)

  function engine (rootConfig: Config, childConfig = rootConfig) {
    _.forIn(childConfig, (value: any, key: string) => {
      if (_.isObject(value)) {
        engine(rootConfig, value)
      } else if (_.isArray(value)) {
        value.forEach((item) => {
          engine(rootConfig, item)
        })
      } else if (_.isString(value)) {
        childConfig[key] = value.replace(/\{\{([a-z0-9]+)\}\}/g, (match, $1) => {
          if (_.isUndefined(rootConfig[$1]) || !_.isString(rootConfig[$1])) {
            throw new Error(`找不到变量 ${$1}`)
          }
          return rootConfig[$1]
        })
      }
    })
  }

  engine(config)

  return config
}

let defaultConfig = convertConfig(systemConfig)
let {
  customConfig
} = getCustomConfig()

/**
 * 全部配置，基于默认和自定义配置的集合
 */
export const config = {
  ...convertConfig(defaultConfig, customConfig)
}
