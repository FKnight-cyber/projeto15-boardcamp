import joi from 'joi';

export default async function gameSchema(req,res,next){
    const gameSchema = joi.object({
        name: joi.string().required(),
        image: joi.string().required(),
        stockTotal: joi.number().min(1).required(),
        categoryId: joi.number().min(1).required(),
        pricePerDay: joi.number().min(1).required()
    });

    const { error } = gameSchema.validate(req.body);

    if(error) return res.status(400).send(error.details.map(detail => detail.message));
    
    next();
}