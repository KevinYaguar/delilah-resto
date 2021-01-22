const Sequelize = require("sequelize");
const db_data = require('../db_connection_data');
const sequelize = new Sequelize(
    db_data.conf_db_name,
    db_data.conf_user,
    db_data.conf_password, {
        host: db_data.conf_db_host,
        dialect: 'mysql',
        port: db_data.conf_port,
        dialectOptions: {
            multipleStatements: true
        }
});

const {search_product} = require('./Products-functions')

let if_product_exists_reject = (req, res, next) => {
    let {
        nombre
    } = req.body;
    search_product(nombre)
        .then(proyects => {
            let producto = proyects.find(p => p.nombre == nombre)
            if (!producto) {
                return next();
            } else {
                res.status(409).send({
                    status: 409,
                    mensaje: 'El producto que quieres subir ya existe'
                })
            }
        })
}

let if_product_exists_next = (req, res, next) => {
    let {
        nombre
    } = req.body;
    search_product(nombre)
        .then(proyects => {
            let producto = proyects.find(p => p.nombre == nombre)
            if (!producto) {
                res.status(404).send({
                    status: 404,
                    mensaje: 'El producto que indicaste no existe'
                })
                
            } else {
                return next();
            }
        })
}

const campo_valido = (req, res, next) => {
    let {campo} = req.body;
    if(campo === 'nombre' || campo === 'precio'){
        next();
    } else{
        res.status(409).send({
            status:'error',
            mensaje:'Los terminos válidos para campo son "nombre" o "precio"'
        })
    }

}

module.exports = {
    if_product_exists_next,
    if_product_exists_reject,
    campo_valido
}