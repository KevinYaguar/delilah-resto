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

async function insertar_pedido(pedido) {
    //let arrayPedido = Object.values(pedido)
    let {id_pedido, estado, usuario_id, pago, direccion} = pedido;

    let resultado = await sequelize.query('INSERT INTO PEDIDOS (id_pedido, estado, usuario_id, pago, direccion, fecha) VALUES (?, ?, ?, ?, ?, now())', {
        replacements: [id_pedido, estado, usuario_id, pago, direccion]
    });
    
    //console.log(resultado); [id, ok]
    let id = resultado[0];

    let {detalles} = pedido;

    for(i=0; i < detalles.length; i++){
        let resultado2 = sequelize.query('INSERT INTO DETALLES (id_pedido, precio_unitario, id_producto, cantidad) VALUES (?, ?, ?, ?)', {
            replacements: [id, detalles[i].precio_unitario, detalles[i].id_producto, detalles[i].cantidad]
        });
    }
        
    return resultado;
}



async function buscar_pedido(userId) {
    let resultado = await sequelize.query(`SELECT * FROM pedidos p, detalles d, productos prod WHERE p.id_pedido=d.id_pedido AND d.id_producto=prod.id_producto AND usuario_id = ${userId}`, {
        type: sequelize.QueryTypes.SELECT
    });
    return resultado;
}

async function get_all_orders () {
   let resultado = await sequelize.query('SELECT * FROM pedidos p, detalles d, productos prod WHERE p.id_pedido=d.id_pedido AND d.id_producto=prod.id_producto', {
        type: sequelize.QueryTypes.SELECT
    })
    
    return resultado;
}

async function update_state (id_pedido, estado){
    let resultado = await  sequelize.query(`UPDATE pedidos SET estado = ? WHERE id_pedido = ?`, {
        replacements: [estado, id_pedido]
    })
    
    return resultado;
}

async function delete_order (id_pedido){
    let resultado = sequelize.query(`DELETE * FROM pedidos WHERE id_pedido = ?`, {
        replacements: [id_pedido]
    })
    return resultado;
}

module.exports = {
    update_state,
    get_all_orders,
    buscar_pedido,
    insertar_pedido,
    delete_order,

}