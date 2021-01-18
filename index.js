require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt')
const cors = require('cors');

const jwtClave = process.env.CLAVE; 

const app = express();
app.use(cors());
app.use(express.json());

const {
    insertarUsuario, 
    buscar_usuario
    } = require('./Users/Users-Functions.js')
const {
    if_user_exists_reject,
    if_user_exists_next, 
    user_pass, data_request, 
    check_rol
} = require('./Users/Users-Middlewares.js');

const {
    get_products_list, 
    insert_product,
    delete_product,
    update_product
} = require('./Products/Products-functions.js')

const {
    if_product_exists_next, if_product_exists_reject
} = require('./Products/Products-Middlewares.js')

const {
    insertar_pedido,
    
    verificar_si_existe_delete_update_PRODUCTOS,
    verificar_si_existe_delete_update_PEDIDOS,
    delete_pedido,
    autenticar_usuario_PEDIDOS,
} = require('./funciones')


//Middleware que solicita contraseña de administrador en todos los endpoint excepto en /usuarios
app.use(expressJwt({ secret: jwtClave, algorithms: ['sha1', 'RS256', 'HS256'] })
    .unless({ path: ["/login", "/crear_usuario"] }));

app.use(function (err, req, res, next){
    if(err.name == 'UnauthorizedError'){
        res.status(401).send({status:'error 401', mensaje:'Tienes que estar logueado para realizar esta acción'})
    } else{
        next();
    }
})

///////////////////////////////////////////ENDPOINTS USUARIOS//////////////////////////////////////////


app.post('/login', data_request, if_user_exists_next, user_pass,  (req, res)=>{
    let {usuario} = req.body;

    let token = jwt.sign({usuario: usuario}, jwtClave)
    
    res.status(200).send(
        {status:'OK', 
        usuario: usuario, 
        mensaje:'Login success',  
        token: token
    })
})

app.get('/usuarios', (req, res) => {
    let token = (req.headers.authorization).split(' ')[1];
    
    let decodificado = jwt.verify(token, jwtClave)

    const usuario = decodificado.usuario;

    buscar_usuario(decodificado.usuario)
        .then(arrayUsuarios =>{
            let user = arrayUsuarios.find(u => u.usuario == usuario)
            res.status(200).send(user)
        })
})

app.post('/crear_usuario', if_user_exists_reject, (req, res) => {
    let {usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña, role} = req.body;
        
    insertarUsuario(usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña, role)
        .then(proyects => res.status(201).send({
                status: 'OK',
                mensaje: `${role} agregado exitosamente`
            }))
            .catch(err => console.log(err));
})


///////////////////////////////////////////ENDPOINTS PRODUCTOS//////////////////////////////////////////


app.get('/productos', (req, res) => {
    
    get_products_list()
        .then(proyects => res.status(200).send(proyects))
        .catch(err => console.log(err));

})

app.post('/subir_producto', check_rol,if_product_exists_reject, (req, res) => {

    insert_product(req.body)
        .then(proyects => res.status(200).send({
            status: 200,
            mensaje: 'Producto agregado exitosamente'
        })).catch(err => console.log(err));
})


app.delete('/borrar_producto', check_rol, if_product_exists_next, (req, res) => {
    let {
        nombre
    } = req.body;
    delete_product(nombre)
        .then(proyects =>{
            res.status(200).send({
                status:'ok',
                mensaje:'Producto eliminado con exito'
            })          
        }).catch(err => console.log(err));
})


app.put('/actualizar_producto', check_rol,if_product_exists_next, (req, res) => {
    let {nombre, campo, nuevo_valor} = req.body;

    update_product(nombre, campo, nuevo_valor)
        .then(proyects => {
            res.status(200).send({
                status:'ok',
                mensaje:'Modificacion realizada con exito!'
            })
        }).catch(err=> console.log(err))
})
//////////////////////////////////////////ENDPOINT PEDIDOS////////////////////////////////////////// 


app.get('/pedidos', (req, res) => {
    let {id_pedido} = req.query;
    console.log(id_pedido)
    if (id_pedido) {
        buscar_pedido(id_pedido)
            .then(proyects => {
                if (proyects.length == 0) {
                    res.status(404).send({
                        mensaje: 'pedido no encontrado'
                    })
                } else {
                    res.status(200).send(proyects)
                }
            }).catch(err => console.log(err));
    } else if (!id_pedido) {
        sequelize.query('SELECT * FROM pedidos', {
                type: sequelize.QueryTypes.SELECT
            })
            .then(proyects => res.status(200).send(proyects)).catch(err => console.log(err));
    }
});


app.post('/nuevo_pedido', autenticar_usuario_PEDIDOS, (req, res) => {
    insertar_pedido(req.body)
        .then(proyects => res.status(200).send({
            status: 'OK',
            mensaje: 'Pedido agregado exitosamente'
        }))
        .catch(err => console.log(err));
})

app.put('/pedidos', verificar_si_existe_delete_update_PEDIDOS, (req, res) => {
    let {
        id_pedido,
        nuevo_estado
    } = req.body;
    sequelize.query(`UPDATE pedidos SET estado = ? WHERE id_pedido = ?`, {
            replacements: [nuevo_estado, id_pedido]
        })
        .then(proyects => res.status(200).send({
            status: 'OK',
            mensaje: 'Modificacion realizada'
        }))
        .catch(err => console.log(err));
})



app.delete('/pedidos', verificar_si_existe_delete_update_PEDIDOS, (req, res) => {
    let {id_pedido} = req.body;
    delete_pedido(id_pedido).then(proyects => res.status(200).send({
        status: 'OK',
        mensaje: 'Pedido eliminado con éxito'
    }))
    .catch(err => console.log(err));
})

app.listen(process.env.SERVER_PORT, (req, res) => {
    console.log('Servidor corriendo en el puerto 3000');
})

app.use((err, req, res, next) => {
    if (!err) {
        next();
    } else {
        console.log(JSON.stringify(err));
        res.status(500).send({status: 500, mensaje:'Ha ocurrido un error inesperado'})
    }
})