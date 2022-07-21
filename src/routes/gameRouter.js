import { Router } from 'express';
import gameSchema from '../schemas/gameSchema.js';
import { addGame, getGames } from '../controllers/gamesController.js';

const gameRouter = Router();

gameRouter.get('/games',getGames);
gameRouter.post('/games',gameSchema,addGame);

export default gameRouter;