import { config } from 'dotenv';
import path from "path";
import _ from "lodash";

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
} else {
  config({ path: '.env' });
}

export const ROOT_PATH = path.resolve(path.join(__dirname, '../..'));

const Config: any = _.pick(process.env, [
  'NODE_ENV',
  'STORAGE_PROVIDER', 'REDIS_URL', 'REDIS_KEY_PREFIX', 'LEVELDB_PATH',
  'ALI_API_KEY', 'ALI_API_SECRET', 'ALI_SMS_TEMPLATE', 'ALI_SMS_SIGN',
  'ALI_API_KEY2', 'ALI_API_SECRET2', 'ALI_SMS_TEMPLATE2', 'ALI_SMS_SIGN2',
  'TENCENT_API_KEY', 'TENCENT_API_SECRET', 'TENCENT_SMS_TEMPLATE', 'TENCENT_SMS_SIGN',
  'TENCENT_API_KEY2', 'TENCENT_API_SECRET2', 'TENCENT_SMS_TEMPLATE2', 'TENCENT_SMS_SIGN2',
  'SMS_PROVIDER', 'SMS_MOCK_ACCOUNTS', 'SMS_SANDBOX', 'SMS_TTL',
]);
Config.REDIS_KEY_PREFIX = Config.REDIS_KEY_PREFIX || '';
Config.SMS_SANDBOX = Config.SMS_SANDBOX?.toLowerCase() === 'true'
Config.SMS_TTL = Number(Config.SMS_TTL) || 600
Config.SMS_INTERVAL = Number(Config.SMS_INTERVAL) || 60
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
