import sinon from 'sinon'
import _ from 'lodash'
import SMSCode from './code';
import cache from './cache';

describe('SMSCode', () => {
  const mobile1 = '13012345678'
  const mobile2 = '13012345679'
  const mobile3 = '13012345670'

  describe('generateCode', () => {
    beforeAll(async () => {
      await cache.del(`timestamp:${mobile1}`)
      await cache.del(`timestamp:${mobile2}`)
      await cache.del(`timestamp:${mobile3}`)
      await cache.del(`code:${mobile1}:*`)
      await cache.del(`code:${mobile2}:*`)
      await cache.del(`code:${mobile3}:*`)
    })
    it('生成验证码失败 - 两次生成的时间间隔太短', async () => {
      await SMSCode.generateCode(mobile1)
      expect(SMSCode.generateCode(mobile1)).rejects.toBeDefined()
    })
    it ('生成验证码成功', async () => {
      const stub = sinon.stub(_, 'random')
      stub.returns(123456)

      const code = await SMSCode.generateCode(mobile2)
      expect(code).toEqual('123456')

      stub.restore()
    })
  })
  describe('verifyCode', () => {
    it('验证失败 - 验证码无效', async () => {
      const ret = await SMSCode.verifyCode(mobile3, 'abcdef')
      expect(ret).toBe(false)
    })
    it('验证失败 - 验证码过期', async () => {
      const code = '123456'
      const now = Date.now()
      await cache.set(`code:${mobile3}:${code}`, (now - 3600000).toString())

      const ret = await SMSCode.verifyCode(mobile3, code)
      expect(ret).toBe(false)
    })
    it('验证通过并删除该验证码', async () => {
      const code = await SMSCode.generateCode(mobile3)
      const ret = await SMSCode.verifyCode(mobile3, code)
      expect(ret).toBe(true)
      expect(await cache.get(`code:${mobile3}:${code}`)).toBeFalsy()
    })
  })
})
