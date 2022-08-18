// 短信验证码
import Router from "express-promise-router";
import smsController from "@/controllers/sms";

const router = Router();
export default router;

router.post('/send', smsController.send);
router.post('/check', smsController.check);
