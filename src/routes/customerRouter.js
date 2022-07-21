import { Router } from 'express';
import customerSchema from '../schemas/customerSchema.js';
import { addCustomers, getCustomers, getCustomersById, updateCustomer } from '../controllers/customersController.js';

const customerRouter = Router();

customerRouter.get('/customers',getCustomers);
customerRouter.get('/customers/:id',getCustomersById);
customerRouter.post('/customers',customerSchema ,addCustomers);
customerRouter.put('/customers/:id',customerSchema,updateCustomer);

export default customerRouter;