const Joi = require('@hapi/joi');

const registerValidation = (data) =>{
    const schema = Joi.object({
        firstName: Joi.string().max(16).required(),
        lastName: Joi.string().max(16).required(),
        gender: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().min(8).max(16).required()
    })
    return schema.validate(data);
}

const loginValidation = (data) =>{
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().min(8).max(16).required()
    })
    return schema.validate(data);
}

const courseValidation = (data) =>{
    const schema = Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        description: Joi.string().required(),
        level: Joi.string().required(),
    })
    return schema.validate(data);
}

const classValidation = (data) =>{
    const schema = Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        description: Joi.string().required(),
        level: Joi.string().required(),
    })
    return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.courseValidation = courseValidation;