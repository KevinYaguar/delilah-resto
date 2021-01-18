const Sequelize = require("sequelize");
const db_data = require('./db_connection_data');
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

//////////////////////PRODUCTOS////////////////////////




let verificar_si_existe_delete_update_PRODUCTOS = (req, res, next) => {
    let {nombre} = req.body;
    buscar_producto(nombre)
            .then(proyects => {
                let product = proyects.find(p => p.nombre == nombre);
                if (product) {
                    return next();
                } else if (!product) {
                    res.status(404).send({
                        status: 404,
                        mensaje: 'El producto no existe'
                    });
                }
            })
}



//////////////////////PEDIDOS//////////////////////////


let verificar_si_existe_delete_update_PEDIDOS = (req, res, next) => {
    let {id_pedido} = req.body;
    buscar_pedido(id_pedido)
            .then(proyects => {
                let pedido = proyects.find(p => p.id_pedido == id_pedido);
                if (pedido) {
                    return next();
                } else if (!pedido) {
                    res.status(404).send({
                        status: 404,
                        mensaje: 'El numero de pedido es incorrecto'
                    });
                }
            })
}

let autenticar_usuario_PEDIDOS = (req, res, next)=>{
    let {usuario} = req.body;
    buscar_usuario(usuario)
        .then(proyects =>{
            let user = proyects.find(u => u.usuario == usuario)
            if(user){
                next();
            }
            else {
                res.status(404).send({status:'404, usuario no encontrado', mensaje: 'debe ingresar un usuario valido para realizar un pedido'})
            }
        }) 
}



async function insertar_pedido(pedido) {
    let arrayPedido = Object.values(pedido)
    let resultado = sequelize.query('INSERT INTO pedidos (estado, hora, id_pedido, cantidad, descripcion, pago, usuario, direccion) VALUES (?)', {
        replacements: [arrayPedido]
    });
    return resultado;
}

async function buscar_pedido(id_pedido) {
    let resultado = await sequelize.query('SELECT * FROM pedidos WHERE id_pedido = ?', {
        replacements: [id_pedido],
        type: sequelize.QueryTypes.SELECT
    });
    return resultado;
}

async function delete_pedido(id_pedido) {
    sequelize.query('DELETE FROM pedidos WHERE id_pedido = ?', {
        replacements: [id_pedido]
    })
    .then(proyects => res.status(200).send({
        status: 'OK',
        mensaje: 'Pedido eliminado con éxito'
    }))
    .catch(err => console.log(err));
}

module.exports = {

    buscar_pedido,

    insertar_pedido,

    verificar_si_existe_delete_update_PRODUCTOS,
    verificar_si_existe_delete_update_PEDIDOS,
    delete_pedido,
    autenticar_usuario_PEDIDOS,
};