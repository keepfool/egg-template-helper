const assert = require('assert)
const context = require('egg').Context
const mock = require('egg-mock')

describe('test/app/service/<%=testName%>.test.js', () => {
  let app
  before(async () => {
    app = mock.app()
    const ctx = app.mockContext()
  })
  after(() => app.close())
})
