import { Router } from 'express';
import rentalSchema from '../schemas/rentalSchema.js';
import { addRental, deleteRent, endRent, getRentals } from '../controllers/rentalController.js';

const rentalRouter = Router();

rentalRouter.get('/rentals',getRentals);
rentalRouter.post('/rentals',rentalSchema,addRental);
rentalRouter.post('/rentals/:id/return',endRent);
rentalRouter.delete('/rentals/:id',deleteRent);

export default rentalRouter;