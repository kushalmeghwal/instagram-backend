import {json,Router} from 'express';
import {AuthController} from '../controllers/authController.ts';

const router=Router();
const Controller=new AuthController();

router.post('/api/signup',(request,response)=>{
    Controller.signup(request,response)
});
router.post('/api/signin',json(),(request,response)=>{
    Controller.signin(request,response)
});

export default router;