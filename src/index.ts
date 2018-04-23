import $new, { NewCommand } from './cli/new'
import $delete, { DeleteCommand } from './cli/delete'
import rename, { RenameCommand } from './cli/rename'

export {
  NewCommand,
  DeleteCommand,
  RenameCommand
}

export default [
  $new,
  $delete,
  rename
]

exports.getUtil = () => {
  return require('./util')
}

exports.getDeclare = () => {
  return require('./declare')
}
