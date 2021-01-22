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

const valid_state = (req, res, next)=>{
    let {estado} = req.body;
    if(estado === 'nuevo' || estado === 'preparando' || estado === 'confirmado' || estado === 'enviando' || estado === 'cancelado' || estado === 'entregado'){
        next();
    } else{
        res.status(409).send({
            status:'error',
            mensaje:'Ingrese un estado válido'
        })
    }
}

module.exports = {
    valid_state
}