import * as assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'

describe('test/app/service/<%=pascalCaseName%>.test.ts', () => {
  let ctx: Context

  before(async () => {
    ctx = app.mockContext()
  })
})
