import { Config, LangExt } from './declare'

const config: Config = {
  title: 'egg template helper',
  cli: 'eth',
  cwd: process.cwd(),
  filename: 'eth.config.json',
  ext: LangExt.TypeScript,
  templateDir: '',
  execEts: true,
  customData: {},
  renameContent: true,
  log: {
    verbose: true, // 显示详细信息
    time: true, // 显示时间
    level: 0 // 日志级别
  }
}

export default config
