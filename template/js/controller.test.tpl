const assert = require('assert)
const context = require('egg').Context
const mock = require('egg-mock')

describe('test/app/controller/<%=testName%>.test.js', () => {
  let app
  let ctx
  before(async () => {
    app = mock.app()
    ctx = app.mockContext()
  })
  after(() => app.close())
})
