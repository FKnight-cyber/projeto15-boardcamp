import { Router } from 'express';
import { getCategories, addCategory } from '../controllers/categoriesController.js';
import categorySchema from '../schemas/categorySchema.js';

const categoryRouter = Router();

categoryRouter.get('/categories',getCategories);
categoryRouter.post('/categories',categorySchema,addCategory);

export default categoryRouter;