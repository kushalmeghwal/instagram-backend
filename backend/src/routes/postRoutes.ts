import { Router } from 'express';
import { PostController } from '../controllers/postController.ts';
import { CustomRequest,Authenticator } from '../middlewares/authenticator.ts';

const router = Router();
const Controller = new PostController();


import { Response } from 'express';

router.post('/api/post', Authenticator, (request: CustomRequest, response: Response) => {
  Controller.create(request, response);
});

router.get('/api/getPosts', (request, response) => {
  Controller.getPosts(request, response);
});
router.get('/api/post-like/:id', Authenticator, (request, response) => {
  Controller.like(request, response);
});

router.post('/api/post-comment/:id', Authenticator, (request, response) => {
  Controller.comment(request, response);
});
router.post('/api/reply-comment/:id/:idx', Authenticator, (request, response) => {
  Controller.replyComment(request, response);
});
router.get('/api/postId/:id', (request, response) => {
  Controller.getPostById(request, response);
});
export default router;