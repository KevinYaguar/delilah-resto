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

async function insertarUsuario(usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña, role) {
    
    let resultado = await sequelize.query('INSERT INTO usuarios (usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', {
        replacements: [usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña, role]
    });
    return resultado;
}

async function buscar_usuario(usuario) {
    let resultado = await sequelize.query('SELECT * FROM usuarios WHERE usuario = ?', {
        replacements: [usuario],
        type: sequelize.QueryTypes.SELECT
    });
    return resultado;
}

async function login(usuario, contrasena) {
    let resultado = await sequelize.query('SELECT * FROM usuarios WHERE usuario = ? AND contraseña = ?', {
        replacements: [usuario, contrasena],
        type: sequelize.QueryTypes.SELECT
    });
    return resultado;
}

async function buscar_todos_los_usuarios() {
    let resultado = await sequelize.query("SELECT * FROM usuarios", {
        type: sequelize.QueryTypes.SELECT
    })
    return resultado;
}


module.exports = {
    insertarUsuario,
    buscar_usuario,
    buscar_todos_los_usuarios,
    login
}