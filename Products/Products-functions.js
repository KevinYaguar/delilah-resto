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

async function get_products_list() {
    let resultado = await sequelize.query('SELECT * FROM PRODUCTOS', {
        type: sequelize.QueryTypes.SELECT
    });
    return resultado;
}

async function insert_product(producto) {
    let arrayProducto = Object.values(producto)
    let resultado = await sequelize.query('INSERT INTO PRODUCTOS (id_producto, nombre, precio) VALUES (?)', {
        replacements: [arrayProducto]
    })
    return resultado;
}

async function search_product(product) {
    let resultado = await sequelize.query('SELECT * FROM PRODUCTOS WHERE nombre = ?', {
        type: sequelize.QueryTypes.SELECT,
        replacements: [product]
    })
    return resultado;
}

async function delete_product (product){
    let resultado = sequelize.query('DELETE FROM PRODUCTOS WHERE nombre = ?', {
        replacements: [product]
    })

    return resultado;
}



async function update_product (nombre, campo, nuevo_valor) {
    let resultado = sequelize.query(`UPDATE PRODUCTOS SET ${campo} = ?  WHERE nombre = ?`, {replacements: [nuevo_valor, nombre]})

    return resultado;
}

module.exports = {
    get_products_list,
    insert_product,
    search_product,
    delete_product,
    update_product
}