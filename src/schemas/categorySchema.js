import joi from 'joi';

export default async function categorySchema(req,res,next){
    const categorySchema = joi.object({
        name: joi.string().required()
    });
    
    const { error } = categorySchema.validate(req.body);

    if(error) return res.status(400).send(error.details.map(detail => detail.message));

    next();
}
