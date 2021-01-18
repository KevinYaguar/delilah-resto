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

const {insertarUsuario, buscar_usuario, login} = require('./Users/Users.js')
const {if_user_exists_reject, if_user_exists_next, user_pass, data_request} = require('./Users/Users-Middlewares.js')

const {
    buscar_todos_los_productos,
    
    
    buscar_todos_los_usuarios,
    buscar_producto,
    insertar_producto,
    insertar_pedido,
    
    verificar_si_existe_producto,

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
        res.status(401).send({status:'error 401', mensaje:'no tienes autorizacion para realizar esta accion'})
    } else{
        next();
    }
    
})

///////////////////////////////////////////ENDPOINTS USUARIOS//////////////////////////////////////////


app.post('/login', data_request, if_user_exists_next, user_pass,  (req, res)=>{
    let {usuario, contraseña} = req.body;

        let token = jwt.sign({usuario: usuario}, jwtClave)
        //let decodificado = jwt.verify(token, jwtClave)
        res.status(200).send({status:'OK', usuario: usuario, mensaje:'Login success',  token: token})

})


app.get('/usuarios',  (req, res) => {
    let {usuario} = req.query;
    console.log(usuario)
        if (usuario) {
            buscar_usuario(usuario)
                .then(proyects => {
                    if (proyects.length == 0) {
                        res.status(200).send({
                            mensaje: 'El usuario no existe'
                        });
                    } else {
                        res.status(200).send(proyects)
                    }
                })
                .catch(err => res.status(400).send(err));
        } else {
            buscar_todos_los_usuarios()
                .then(proyects =>
                    res.status(200).send(proyects)).catch(err=>console.log(err))
        }
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



app.put('/usuarios', (req, res) => {
    let {
        usuario,
        campo,
        nuevo_valor
    } = req.body;
    sequelize.query(`UPDATE usuarios SET ${campo} = ? WHERE usuario = ?`, {
            replacements: [nuevo_valor, usuario]
        })
        .then(proyects => res.status(200).send({
            status: 'OK',
            mensaje: 'Modificacion realizada'
        }))
        .catch(err => console.log(err));
})

app.delete('/usuarios', (req, res) => {
    let {
        usuario
    } = req.body;
    sequelize.query("DELETE FROM usuarios WHERE usuario = ?", {
            replacements: [usuario]
        })
        .then(proyects => res.status(200).send({
            status: 'OK',
            mensaje: 'Usuario eliminado exitosamente'
        }))
        .catch(err => console.log(err));
})

///////////////////////////////////////////ENDPOINTS PRODUCTOS//////////////////////////////////////////


app.get('/productos', (req, res) => {
    let {
        nombre
    } = req.query;
    if (nombre) {
        buscar_producto(nombre)
            .then(proyects => {
                if (proyects.length == 0) {
                    res.status(404).send({
                        status: 404,
                        mensaje: 'Producto no encontrado'
                    })
                } else {
                    res.status(200).send(proyects)
                }
            }).catch(err => console.log(err));
    } else {
        buscar_todos_los_productos()
            .then(proyects => res.status(200).send(proyects))
            .catch(err => console.log(err));
    }
})

app.post('/subir_producto', verificar_si_existe_producto, (req, res) => {

    insertar_producto(req.body)
        .then(proyects => res.status(200).send({
            status: 200,
            mensaje: 'Producto agregado exitosamente'
        })).catch(err => console.log(err));
})


app.delete('/borrar_producto', verificar_si_existe_delete_update_PRODUCTOS, (req, res) => {
    let {
        nombre
    } = req.body;
    sequelize.query('DELETE FROM productos WHERE nombre = ?', {
            replacements: [nombre]
        })
        .then(proyects => res.status(200).send({
            status: 200,
            mensaje: 'Producto eliminado exitosamente'
        }))
        .catch(err => console.log(err));
})


app.put('/actualizar_producto', verificar_si_existe_delete_update_PRODUCTOS, (req, res) => {
    let {
        nombre,
        campo,
        nuevo_valor
    } = req.body;
    sequelize.query(`UPDATE productos SET ${campo} = ? WHERE nombre = ?`, {
            replacements: [nuevo_valor, nombre]
        })
        .then(proyects => res.status(200).send({
            status: 'OK',
            mensaje: 'Modificacion realizada con éxito'
        })).catch(err => console.log(err));
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