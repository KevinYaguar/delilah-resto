const express = require("express");
const Sequelize = require("sequelize");
const mysql = require("mysql2");
const path = 'mysql://root@localhost:3306/test';
const sequelize = new Sequelize(path, {operators: false});
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

///////////////////////////////////////////ENDPOINTS USUARIOS//////////////////////////////////////////
//middleware VER SI EXISTE para POST usuarios
let verificarSiExistePostUsuarios = (req, res, next) =>{
    let usuario = req.body.usuario;
    sequelize.query('SELECT * FROM usuarios WHERE usuario = ?', 
            {replacements: [usuario], type: sequelize.QueryTypes.SELECT})
                .then(proyects => 
                    {
                        let user = proyects.find(u => u.usuario == usuario)
                        if(!user){
                            return next();
                        } else if(user){
                            res.status(400).send({status: 400, mensaje:'El usuario ya existe'})
                        }
                    }
                    ).catch(err=> console.log(err));
}

app.get('/usuarios', (req, res)=>{
    let {usuario} = req.body;
    if(usuario){
        sequelize.query('SELECT * FROM usuarios WHERE usuario = ?', 
            {replacements: [usuario], type: sequelize.QueryTypes.SELECT})
                .then(proyects =>{ 
                    if(proyects.length == 0){
                        res.status(200).send({mensaje:'El usuario no existe'})
                    } else{
                        res.status(200).send(proyects)
                    }
                })
                .catch(err=> res.status(400).send(err));
    } else{
        sequelize.query("SELECT * FROM usuarios", {type: sequelize.QueryTypes.SELECT})
            .then(proyects=>
                res.status(200).send(proyects))
    }
})

app.post('/usuarios', verificarSiExistePostUsuarios, (req, res)=>{
    let {usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña} = req.body;
    sequelize.query('INSERT INTO usuarios (usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña) VALUES (?, ?, ?, ? , ?, ?,?)', {replacements: [usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña]}) 
    .then(proyects=> res.status(200).send({status:'OK', mensaje:'Usuario agregado exitosamente'}))
        .catch(err=>console.log(err));
})

//middleware VER SI EXISTE para DELETE y UPDATE usuarios

let verificarSiExisteDeleteUpdateUsuarios = (req, res, next) =>{
    let usuario = req.body.usuario;
    sequelize.query('SELECT * FROM usuarios WHERE usuario = ?', {replacements: [usuario], type: sequelize.QueryTypes.SELECT})
    .then(proyects =>{
        let user = proyects.find(u=>u.usuario == usuario);
        if(user){
            return next();
        } else if(!user){
            res.status(200).send({status:400, mensaje:'El usuarioingresado no existe'});
        }
    })
}

app.put('/usuarios', verificarSiExisteDeleteUpdateUsuarios, (req, res)=>{
    let {usuario, campo, nuevo_valor} = req.body;
    sequelize.query(`UPDATE usuarios SET ${campo} = ? WHERE usuario = ?`, {replacements: [nuevo_valor, usuario]})
        .then(proyects=> res.status(200).send({status:'OK', mensaje:'Modificacion realizada'}))
            .catch(err=>console.log(err));
})


app.delete('/usuarios', verificarSiExisteDeleteUpdateUsuarios, (req, res)=>{
    let {usuario} = req.body;
    sequelize.query("DELETE FROM usuarios WHERE usuario = ?", {replacements: [usuario]})
        .then(proyects=> res.status(200).send({status:'OK', mensaje:'Usuario eliminado exitosamente'}))
            .catch(err=>console.log(err));
})

///////////////////////////////////////////ENDPOINTS PRODUCTOS//////////////////////////////////////////

app.get('/productos', (req, res)=>{
    let{nombre} = req.body;
    if(nombre){
        sequelize.query('SELECT * FROM productos WHERE nombre = ?', {type: sequelize.QueryTypes.SELECT, replacements: [nombre]})
        .then(proyects => {
            if(proyects.length == 0){
                res.status(404).send({status:404, mensaje:'Producto no encontrado'})
            } else{
                res.status(200).send(proyects)
            }
        }).catch(err=>console.log(err));
    } else{
        sequelize.query('SELECT * FROM productos', {type: sequelize.QueryTypes.SELECT})
        .then(proyects=> res.status(200).send(proyects))
            .catch(err=>console.log(err));
    }
})

let verificarSiExistePostProducto = (req, res, next)=>{
    let nombre = req.body.nombre;
    sequelize.query('SELECT * FROM productos WHERE nombre = ?', {replacements: [nombre], type: sequelize.QueryTypes.SELECT})
        .then(proyects => {
            let producto = proyects.find(p=>p.nombre == nombre)
            if(!producto){
                return next();
            } else if(producto){
                res.status(400).send({status:400, mensaje:'El producto que quieres subir ya existe'})
            }
        })
}

app.post('/productos', verificarSiExistePostProducto, (req, res)=>{
    let {id_producto, nombre, precio} = req.body;
    sequelize.query('INSERT INTO productos (id_producto, nombre, precio) VALUES (?, ?, ?)', {replacements: [id_producto, nombre, precio]})
        .then(proyects=> res.status(200).send({status:'OK', mensaje:'Producto agregado exitosamente'})).catch(err=>console.log(err));
})

//MIDDLEWARE VER SI EXISTE PRODUCTO PARA MODIFICAR O BORRAR

let verificarSiExisteDeleteUpdateProducto = (req, res, next) =>{
    let producto = req.body.nombre;
    sequelize.query('SELECT * FROM productos WHERE nombre = ?', {replacements: [producto], type: sequelize.QueryTypes.SELECT})
        .then(proyects=> {
            let product = proyects.find(p=>p.nombre == producto);
            if(product){
                return next();
            } else if(!product){
                res.status(400).send({status:400, mensaje:'El producto no existe'});
            }
        })
}

app.delete('/productos', verificarSiExisteDeleteUpdateProducto, (req, res)=>{
    let {nombre} = req.body;
    sequelize.query('DELETE FROM productos WHERE nombre = ?', {replacements: [nombre]})
        .then(proyects => res.status(200).send({status:'OK', mensaje:'Producto eliminado exitosamente'}))
            .catch(err=>console.log(err));
})


app.put('/productos', verificarSiExisteDeleteUpdateProducto, (req, res)=>{
    let{nombre, campo, nuevo_valor} = req.body;
    sequelize.query(`UPDATE productos SET ${campo} = ? WHERE nombre = ?`, {replacements: [nuevo_valor, nombre]})
        .then(proyects=> res.status(200).send({status:'OK', mensaje:'Modificacion realizada con éxito'})).catch(err=>console.log(err));
})
//////////////////////////////////////////ENDPOINT PEDIDOS////////////////////////////////////////// 

app.get('/pedidos', (req, res)=>{
    let id_pedido = req.body.id_pedido;
    if(id_pedido){
        sequelize.query('SELECT * FROM pedidos WHERE id_pedido = ?', {replacements: [id_pedido], type: sequelize.QueryTypes.SELECT})
            .then(proyects=>{ 
                if(proyects.length == 0){
                    res.status(404).send({mensaje:'pedido no encontrado'})
                } else{
                    res.status(200).send(proyects)
                }
            }).catch(err=>console.log(err));
    } else if(!id_pedido){
        sequelize.query('SELECT * FROM pedidos', {type: sequelize.QueryTypes.SELECT})
        .then(proyects=> res.status(200).send(proyects)).catch(err=>console.log(err));
    }
});

//middleware para ver si el pedido ya esta subido (por numero de ID). Igual el id es NULL y mysql le da el valor A.I.

let verificarSiExistePedidoPOST = (req, res, next)=>{
    let id_pedido = req.body.id_pedido;
    sequelize.query('SELECT * FROM pedidos WHERE id_pedido = ?', {replacements: [id_pedido], type: sequelize.QueryTypes.SELECT})
        .then(proyects =>{
            let pedido = proyects.find(p=>p.id_pedido == id_pedido);
            if(!id_pedido){
                return next();
            } else if(id_pedido){
                res.status(400).send({status:'error', mensaje:'el numero de pedido ya fue utilizado'});
            }
        })
}

app.post('/pedidos', verificarSiExistePedidoPOST, (req, res)=>{
    let {estado, hora, id_pedido, descripcion, pago, usuario_id, direccion} = req.body;
    sequelize.query('INSERT INTO pedidos (estado, hora, id_pedido, descripcion, pago, usuario_id, direccion) VALUES (?, ?, ?, ?, ?, ?, ?)', {replacements: [estado, hora, id_pedido, descripcion, pago, usuario_id, direccion]}) 
        .then(proyects=> res.status(200).send({status:'OK', mensaje:'Pedido agregado exitosamente'}))
            .catch(err=>console.log(err));
})

let verificarSiExistePedidoDELETEandUPDATE = (req, res, next)=>{
    let id_pedido = req.body.id_pedido;
    sequelize.query('SELECT * FROM pedidos WHERE id_pedido = ?', {replacements: [id_pedido], type: sequelize.QueryTypes.SELECT})
        .then(proyects =>{
            let pedido = proyects.find(p=>p.id_pedido == id_pedido);
            if(pedido){
                return next();
            } else if(!pedido){
                res.status(400).send({status:'error', mensaje:'El numero de pedido es incorrecto'});
            }
        })
}

app.put('/pedidos', verificarSiExistePedidoDELETEandUPDATE, (req, res)=>{
    let{id_pedido, campo, nuevo_valor} = req.body;
    sequelize.query(`UPDATE pedidos SET ${campo} = ? WHERE id_pedido = ?`, {replacements: [nuevo_valor, id_pedido]})
        .then(proyects => res.status(200).send({status:'OK', mensaje:'Modificacion realizada'}))
            .catch(err=>console.log(err));
})

app.delete('/pedidos', (req, res)=>{
    let id_pedido = req.body.id_pedido;
    sequelize.query('DELETE FROM pedidos WHERE id_pedido = ?', {replacements: [id_pedido]})
        .then(proyects => res.status(200).send({status:'OK', mensaje:'Pedido eliminado con éxito'}))
            .catch(err=>console.log(err));
})

app.listen(process.env.SERVER_PORT, (req, res) =>{
    console.log('Servidor corriendo en el puerto 3000');
})


app.use((err, req, res, next)=>{
    if(!err){
        next();
    }else{
        console.log(JSON.stringify(err));
    }
})
