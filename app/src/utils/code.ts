import _ from 'lodash';
import config from "@/config";
import cache from '@/utils/cache';
import logger from "@/utils/logger";

const randomCode = (): string => {
  return _.random(100000, 999999).toString()
}
// 生成验证码
const generateCode = async (mobile: string): Promise<string> => {
  const smsInterval = config.SMS_INTERVAL * 1000
  const now = Date.now()
  const lastTime = Number(await cache.get(`timestamp:${mobile}`))
  if (lastTime && (now - lastTime) < smsInterval) {
    throw new Error(`两次发送的间隔时间不能小于 ${smsInterval}ms`)
  }

  const code = randomCode();
  await cache.set(`code:${mobile}:${code}`, now.toString(), config.SMS_TTL + 5);
  await cache.set(`timestamp:${mobile}`, now.toString(), config.SMS_TTL + 5);

  return code
}

// 检查验证码
const verifyCode = async (mobile: string, code: string): Promise<boolean> => {
  const key = `code:${mobile}:${code}`
  const timestamp = await cache.get(key)
  if (!timestamp) {
    logger.error(`${mobile} 验证码 ${code} 无效`)
    return false
  }

  await cache.del(key)

  const now = Date.now()
  if ((now - Number(timestamp)) > (config.SMS_TTL * 1000)) {
    logger.error(`${mobile} 验证码 ${code} 过期`)
    return false
  }

  return true
}

const clearTimestamp = async (mobile: string) => {
    await cache.del(`timestamp:${mobile}`)
}
const clearCode = async (mobile: string) => {
    await cache.del(`code:${mobile}:*`)
}

export default {
  randomCode,
  generateCode,
  verifyCode,
  clearTimestamp,
  clearCode,
}
