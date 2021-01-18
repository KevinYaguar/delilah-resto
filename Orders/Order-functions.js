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

async function insertar_pedido(pedido, usuario) {
    let arrayPedido = Object.values(pedido)

    let resultado = await sequelize.query('INSERT INTO pedidos (estado, hora, id_pedido, cantidad, descripcion, pago, direccion, usuario) VALUES (?, ?)', {
        replacements: [arrayPedido, usuario]
    });
    return resultado;
}

async function buscar_pedido(usuario) {
    let resultado = await sequelize.query('SELECT * FROM pedidos WHERE usuario = ?', {
        replacements: [usuario],
        type: sequelize.QueryTypes.SELECT
    });
    return resultado;
}

async function get_all_orders () {
   let resultado = await sequelize.query('SELECT * FROM pedidos', {
        type: sequelize.QueryTypes.SELECT
    })
    return resultado;
}

async function update_state (id_pedido, nuevo_estado){
    let resultado = await  sequelize.query(`UPDATE pedidos SET estado = ? WHERE id_pedido = ?`, {
        replacements: [nuevo_estado, id_pedido]
    })
    return resultado;
}

module.exports = {
    update_state,
    get_all_orders,
    buscar_pedido,
    insertar_pedido
}