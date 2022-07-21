import joi from 'joi';


export default async function customerSchema(req,res,next){
    const Joi = require('joi').extend(require('@joi/date'));
    const customerSchema = joi.object({
        name: joi.string().required(),
        phone: joi.string().pattern(new RegExp('^[0-9]{10,11}$')).required(),
        cpf: joi.string().pattern(new RegExp('^[0-9]{11}$')).required(),
        birthday: Joi.date().format('YYYY-MM-DD').utc().required()
    });

    const { error } = customerSchema.validate(req.body,{abortEarly:false});

    if(error) return res.status(400).send(error.details.map(detail => detail.message));

    next();
}