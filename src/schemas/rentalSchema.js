import joi from 'joi';

export default async function rentalSchema(req,res,next){
    const rentalSchema = joi.object({
        customerId: joi.number().min(1).required(),
        gameId: joi.number().min(1).required(), 
        daysRented: joi.number().min(1).required()               
    });

    const { error } = rentalSchema.validate(req.body,{abortEarly:false});
     
    if(error) return res.status(400).send(error.details.map(detail => detail.message));

    next();
}