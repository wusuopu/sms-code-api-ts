import { config } from 'dotenv';
import path from "path";
import _ from "lodash";

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
} else {
  config({ path: '.env' });
}

const bool = (value: string): boolean => {
  return value?.toLowerCase() === 'true' || value === '1';
}
const number = (value: string, defaultValue: number|undefined): number => {
  const ret = Number(value)
  if (_.isNaN(ret)) { return defaultValue }
  return ret
}

export const ROOT_PATH = path.resolve(path.join(__dirname, '../..'));

const Config: any = _.pick(process.env, [
  'NODE_ENV',
  'STORAGE_PROVIDER', 'REDIS_URL', 'REDIS_KEY_PREFIX', 'LEVELDB_PATH',
  'ALI_API_KEY', 'ALI_API_SECRET', 'ALI_SMS_TEMPLATE', 'ALI_SMS_SIGN',
  'ALI_API_KEY2', 'ALI_API_SECRET2', 'ALI_SMS_TEMPLATE2', 'ALI_SMS_SIGN2',
  // 国内短信
  'TENCENT_SMS_APP_ID', 'TENCENT_SECRET_ID', 'TENCENT_SECRET_KEY', 'TENCENT_SMS_TEMPLATE', 'TENCENT_SMS_SIGN',
  // 国际/港澳台短信
  'TENCENT_SMS_APP_ID2', 'TENCENT_SECRET_ID2', 'TENCENT_SECRET_KEY2', 'TENCENT_SMS_TEMPLATE2', 'TENCENT_SMS_SIGN2',
  'SMS_PROVIDER', 'SMS_MOCK_ACCOUNTS', 'SMS_SANDBOX', 'SMS_DISABLED', 'SMS_TEMP_CODE', 'SMS_TTL', 'SMS_INTERVAL',
]);
Config.REDIS_KEY_PREFIX = Config.REDIS_KEY_PREFIX || '';
Config.SMS_SANDBOX = bool(Config.SMS_SANDBOX);
Config.SMS_DISABLED = bool(Config.SMS_DISABLED);
Config.SMS_TTL = number(Config.SMS_TTL, 600)
Config.SMS_INTERVAL = number(Config.SMS_INTERVAL, 60)
Config.NODE_ENV ||= 'production'


// 测试账号
try {
  Config.SMS_MOCK_ACCOUNTS = JSON.parse(Config.SMS_MOCK_ACCOUNTS)
} catch (error) {
}
if (_.isPlainObject(Config.SMS_MOCK_ACCOUNTS)) {
  Config.SMS_MOCK_ACCOUNTS = {}
}

export const addMockAccount = (mobile: string, code: string) => {
  if (!Config.SMS_MOCK_ACCOUNTS[mobile]) {
    Config.SMS_MOCK_ACCOUNTS[mobile] = [];
  }
  Config.SMS_MOCK_ACCOUNTS[mobile].push(code);
}
export const delMockAccount = (mobile: string) => {
  delete Config.SMS_MOCK_ACCOUNTS[mobile];
}


export default Config;
