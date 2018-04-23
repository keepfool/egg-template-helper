import * as path from 'path'
import { exec, fork } from 'child_process'
import * as cluster from 'cluster'
import { createTsHelperInstance } from 'egg-ts-helper'
import { cleanJs } from 'egg-ts-helper/dist/utils'
import { config } from '../util'

/**
 * 执行egg-ts-helper，重新写入typeings/*.d.ts
 *
 * @export
 */
export function ets () {
  if (
    config.execEts &&
    cluster.isMaster &&
    !process.argv.find(item => item.includes('agent_worker.js'))
  ) {
    // fork a process to watch files change
    const ps = fork(path.resolve(config.cwd, 'node_modules/egg-ts-helper/dist', './bin'), [], {
      execArgv: []
    })

    // kill child process while process exit
    const close = function () {
      if (!ps.killed) {
        if (process.platform === 'win32') {
          exec('taskkill /pid ' + ps.pid + ' /T /F')
        } else {
          ps.kill('SIGHUP')
        }
      }
    }

    process.on('exit', close)
    process.on('SIGINT', close)
    process.on('SIGTERM', close)
    process.on('SIGHUP', close)

    // clean local js file at first.
    // because egg-loader cannot load the same property name to egg.
    cleanJs(process.cwd())

    // exec building at first
    createTsHelperInstance().build()
  }
}
