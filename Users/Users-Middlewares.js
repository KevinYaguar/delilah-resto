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

const {buscar_usuario, login} = require('./Users')

let if_user_exists_reject = (req, res, next) => {
    let usuario = req.body.usuario;
    buscar_usuario(usuario)
        .then(proyects => {
            let user = proyects.find(u => u.usuario == usuario)
            if (!user) {
                return next();
            } else if (user){
                res.status(409).send({
                    status: 409,
                    mensaje: 'El usuario ya existe'
                })
            }
        }).catch(err => console.log(err));
}


let if_user_exists_next = (req, res, next) => {
    let {usuario} = req.body;
    buscar_usuario(usuario)
            .then(proyects => {
                let user = proyects.find(u => u.usuario == usuario);
                if (user) {
                    return next();
                } else if (!user) {
                    res.status(404).send({
                        status: 404,
                        mensaje: 'El usuario ingresado no existe'
                    });
                }
            })
}

let user_pass = (req, res, next) => {
    let {usuario, contraseña} = req.body;
    login(usuario, contraseña)
        .then(proyects => {
            let user = proyects.find(u => u.usuario == usuario && u.contraseña == contraseña)
            if (user) {
                return next();
            } else if (!user) {
                res.status(404).send({
                    status: 404,
                    mensaje: 'Contraseña incorrecta'
                });
            }
        })
}

let data_request = (req, res, next) => {
    let {usuario, contraseña} = req.body;
    if(usuario && contraseña){
        next();
    } else{
        res.status(404).send({
            status:'error',
            mensaje:'Debes ingresar un usuario y contraseña para loguearte'
        })
    }
}


module.exports = {
    if_user_exists_reject, 
    if_user_exists_next,
    user_pass,
    data_request

}