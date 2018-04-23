export interface Config extends CustomConfig {
  title: string
  cli: string
  cwd: string
  filename: string
  ext: string
  templateDir: string
  execEts: boolean
  customData: object
  renameContent: boolean
  log: {
    verbose: boolean // 显示详细信息
    time: boolean // 显示时间
    level: number // 日志级别
  }
}

export interface CustomConfig {
  ext?: string
  templateDir?: string
  execEts?: boolean
  customData?: object
  renameContent?: boolean
}
