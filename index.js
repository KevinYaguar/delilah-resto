const express = require("express");
const Sequelize = require("sequelize");
const mysql = require("mysql2");
const path = 'mysql://root@localhost:3306/test';
const sequelize = new Sequelize(path, {
    operators: false
});
const cors = require('cors');

const expressJwt = require('express-jwt')
const jwtClave = 'Pr0y3CtO_4caWik';
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(express.json());


//Middleware que solicita contraseña de administrador en todos los endpoint excepto en /usuarios
app.use(expressJwt({ secret: jwtClave, algorithms: ['sha1', 'RS256', 'HS256'] }).unless({ path: ["/productos", "/login", "/nuevo_pedido", "/crea_usuario"] }));

app.use(function (err, req, res, next){
    if(err.name == 'UnauthorizedError'){
        res.status(401).send({status:'error 401', mensaje:'no tienes autorizacion para realizar esta accion'})
    } else{
        next();
    }
    
})

let verificar_si_existe = (req, res, next)=>{
    let usuario = req.body.usuario;
    let nombre = req.body.nombre;
    let id_pedido = req.body.id_pedido;
    if(usuario){
        buscar_usuario(usuario)
        .then(proyects => {
            let user = proyects.find(u => u.usuario == usuario)
            if (!user) {
                return next();
            } else if (user) {
                res.status(409).send({
                    status: 409,
                    mensaje: 'El usuario ya existe'
                })
            }
        }).catch(err => console.log(err));
    } else if(nombre){
        buscar_producto(nombre)
        .then(proyects => {
            let producto = proyects.find(p => p.nombre == nombre)
            if (!producto) {
                return next();
            } else if (producto) {
                res.status(409).send({
                    status: 409,
                    mensaje: 'El producto que quieres subir ya existe'
                })
            }
        })
    } else if(id_pedido){
        buscar_pedido(id_pedido)
        .then(proyects => {
            let pedido = proyects.find(p => p.id_pedido == id_pedido);
            if (!pedido) {
                return next();
            } else if (pedido) {
                res.status(400).send({
                    status: 'error',
                    mensaje: 'el numero de pedido ya fue utilizado'
                });
            }
        })
    }
}


async function buscar_usuario(usuario) {
    let resultado = await sequelize.query('SELECT * FROM usuarios WHERE usuario = ?', {
        replacements: [usuario],
        type: sequelize.QueryTypes.SELECT
    });
    return resultado;
}
async function login (usuario, contrasena) {
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

///////////////////////////////////////////ENDPOINTS USUARIOS//////////////////////////////////////////

let administrador = {
    usuario: 'administracion',
    contraseña: 'password'
}

app.post('/login', (req, res)=>{
    let {usuario, contraseña} = req.body;
    if(usuario == administrador.usuario && contraseña == administrador.contraseña){
        login(usuario, contraseña)
            .then(proyects =>{
                if(proyects.length == 0){
                    res.status(400).send({status:'error', usuario: usuario, mensaje:'usuario o contraseña incorrectos'})
                }
                else{
                    let token = jwt.sign({usuario: usuario}, jwtClave)
                    let decodificado = jwt.verify(token, jwtClave)
                    res.status(200).send({status:'OK', usuario: usuario, mensaje:'administrador logueado',  token: token})
                }
            })
    } else if(usuario && contraseña){
        login(usuario, contraseña)
            .then(proyects =>{
                if(proyects.length == 0){
                    res.status(400).send({status:'error', usuario: usuario, mensaje:'usuario o contraseña incorrectos'})
                }
                else{
                    res.status(200).send({status:'OK', usuario: usuario, mensaje:'usuario logueado correctamente'})
                }
            }).catch(err=>console.log(err));
    }else{
        res.status(400).send({status:'error', mensaje:'debes ingresar usuario y contraseña para el login'})
    }
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

async function insertarUsuario(usuario) {
    let arrayUsuario = Object.values(usuario);
    let resultado = await sequelize.query('INSERT INTO usuarios (usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña) VALUES (?)', {
        replacements: [arrayUsuario]
    });
    return resultado;
}

app.post('/crear_usuario', verificar_si_existe, (req, res) => {
    insertarUsuario(req.body).then(proyects => res.status(201).send({
            status: 'OK',
            mensaje: 'Usuario agregado exitosamente'
        }))
        .catch(err => console.log(err));
})

//middleware VER SI EXISTE para DELETE y UPDATE usuarios

let verificar_si_existe_delete_update = (req, res, next) =>{
    let usuario = req.body.usuario;
    let nombre = req.body.nombre;
    let id_pedido = req.body.id_pedido;
    if(usuario){
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
    }else if(nombre){
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
    }else if(id_pedido){
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
}


app.put('/usuarios', verificar_si_existe_delete_update, (req, res) => {
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


app.delete('/usuarios', verificar_si_existe_delete_update, (req, res) => {
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

async function buscar_producto(producto) {
    let resultado = await sequelize.query('SELECT * FROM productos WHERE nombre = ?', {
        type: sequelize.QueryTypes.SELECT,
        replacements: [producto]
    })
    return resultado;
}
async function buscar_todos_los_productos() {
    let resultado = await sequelize.query('SELECT * FROM productos', {
        type: sequelize.QueryTypes.SELECT
    });
    return resultado;
}

async function insertar_producto(producto) {
    let arrayProducto = Object.values(producto)
    let resultado = await sequelize.query('INSERT INTO productos (id_producto, nombre, precio) VALUES (?)', {
        replacements: [arrayProducto]
    })
    return resultado;
}

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

app.post('/subir_producto', verificar_si_existe, (req, res) => {

    insertar_producto(req.body)
        .then(proyects => res.status(200).send({
            status: 200,
            mensaje: 'Producto agregado exitosamente'
        })).catch(err => console.log(err));
})


app.delete('/borrar_producto', verificar_si_existe_delete_update, (req, res) => {
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


app.put('/actualizar_producto', verificar_si_existe_delete_update, (req, res) => {
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

async function buscar_pedido(id_pedido) {
    let resultado = await sequelize.query('SELECT * FROM pedidos WHERE id_pedido = ?', {
        replacements: [id_pedido],
        type: sequelize.QueryTypes.SELECT
    });
    return resultado;
}

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

async function insertar_pedido(pedido) {
    let arrayPedido = Object.values(pedido)
    let resultado = sequelize.query('INSERT INTO pedidos (estado, hora, id_pedido, descripcion, pago, usuario_id, direccion) VALUES (?)', {
        replacements: [arrayPedido]
    });
    return resultado;
}

app.post('/nuevo_pedido', verificar_si_existe, (req, res) => {
    insertar_pedido(req.body)
        .then(proyects => res.status(200).send({
            status: 'OK',
            mensaje: 'Pedido agregado exitosamente'
        }))
        .catch(err => console.log(err));
})

app.put('/pedidos', verificar_si_existe_delete_update, (req, res) => {
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

app.delete('/pedidos', (req, res) => {
    let id_pedido = req.body.id_pedido;
    sequelize.query('DELETE FROM pedidos WHERE id_pedido = ?', {
            replacements: [id_pedido]
        })
        .then(proyects => res.status(200).send({
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