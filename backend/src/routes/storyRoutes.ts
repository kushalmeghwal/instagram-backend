import { Router } from 'express';
import { StoryController } from '../controllers/storyController.ts';
import { Authenticator } from '../middlewares/authenticator.ts';

const router = Router();
const Controller = new StoryController();

router.post('/api/story', Authenticator, (request, response) => {
  Controller.create(request, response);
});

export default router;