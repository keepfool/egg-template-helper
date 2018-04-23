declare module 'mem-fs-editor' {
  interface MemFsEditor {
    copyTpl (oPath: String, tPath: String, content: any, tplSettings?: any, options?: any): any
    write (filePath: String, content: String): any
    commit(callback: Function): any
  }
  interface MemFs {
    create (store: any): MemFsEditor
  }
  const memFs: MemFs
  export = memFs
}
