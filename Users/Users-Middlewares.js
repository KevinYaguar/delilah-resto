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

const jwtClave =  process.env.CLAVE; 

const {buscar_usuario, login} = require('./Users-Functions')

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

let role_correction = (req, res, next) => {
    let {role} = req.body;
    if(role === 'Administrador' || role === 'Usuario'){
        next();
    } else{
        res.status(409).send({
            status:'error',
            mensaje:'El campo role solo acepta los términos Administrador o Usuario'
        })
    }
}

let user_pass = (req, res, next) => {
    let {usuario, password} = req.body;
    login(usuario, password)
        .then(proyects => {
            let user = proyects.find(u => u.usuario == usuario && u.password == password)
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
    let {usuario, password} = req.body;
    if(usuario && password){
        next();
    } else{
        res.status(404).send({
            status:'error',
            mensaje:'Debes ingresar un usuario y password para loguearte'
        })
    }
}

const jwt = require('jsonwebtoken');

let check_rol = (req, res, next) => {

    let token = (req.headers.authorization).split(' ')[1];
    
    let decodificado = jwt.verify(token, jwtClave)

    const usuario = decodificado.usuario;

    buscar_usuario(decodificado.usuario)
        .then(arrayUsuarios =>{
            let user = arrayUsuarios.find(u => u.usuario == usuario)
            if(user.role === 'Administrador'){
                next();
            } else {
                res.status(403).send({
                    status:'error',
                    mensaje:'Necesitas ser Administrador para realizar esta acción'
                })
            }
        })
}


module.exports = {
    if_user_exists_reject, 
    role_correction,
    if_user_exists_next,
    user_pass,
    data_request,
    check_rol
}