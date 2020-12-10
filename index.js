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

///////////////////////////////////////////ENDPOINTS USUARIOS

//middleware VER SI EXISTE
 let verificarSiExiste = (req, res, next) =>{
    
    fetch("http://localhost:3000/usuarios")
        .then(res => res.json())
            .then(data => {
                let usuario = 'kevinyaguar';
                user = data.find(user=> user.usuario == usuario)    
                if(user){
                    console.log('hola');
                    return next();
                } else{
                    console.log('holaaaaaaaaaaaaaaaaaaaaa');
                    return next();
                }
    });
 }

app.get('/usuarios', (req, res)=>{
    let {usuario} = req.body;
    if(usuario){
        sequelize.query('SELECT * FROM usuarios WHERE usuario = ?', 
            {replacements: [usuario], type: sequelize.QueryTypes.SELECT})
                .then(proyects => res.status(200).send(proyects))
    } else{
        sequelize.query("SELECT * FROM usuarios", {type: sequelize.QueryTypes.SELECT})
            .then(proyects=>
                res.status(200).send(proyects))
    }
})

app.post('/usuarios', verificarSiExiste, (req, res)=>{
    let {usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña} = req.body;
    sequelize.query('INSERT INTO usuarios (usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña) VALUES (?, ?, ?, ? , ?, ?,?)', {replacements: [usuario_id, usuario, nombre_apellido, mail, telefono, direccion, contraseña]}) 
    .then(proyects=> res.status(200).send({status:'OK', mensaje:'Usuario agregado exitosamente'}))
        .catch(err=>console.log(err));
})

app.put('/usuarios', (req, res)=>{
    let {usuario, campo, nuevo_valor} = req.body;
    sequelize.query(`UPDATE usuarios SET ${campo} = ? WHERE usuario = ?`, {replacements: [nuevo_valor, usuario]})
        .then(proyects=> res.status(200).send({status:'OK', mensaje:'Modificacion realizada'}))
            .catch(err=>console.log(err));
})

app.delete('/usuarios', (req, res)=>{
    let {usuario} = req.body;
    sequelize.query("DELETE FROM usuarios WHERE usuario = ?", {replacements: [usuario]})
        .then(proyects=> res.status(200).send({status:'OK', mensaje:'Usuario eliminado exitosamente'}))
            .catch(err=>console.log(err));
})

///////////////////////////////////////////ENDPOINTS PRODUCTOS

app.get('/productos', (req, res)=>{
    let{nombre} = req.body;
    if(nombre){
        sequelize.query('SELECT * FROM productos WHERE nombre = ?', {type: sequelize.QueryTypes.SELECT, replacements: [nombre]})
        .then(proyects => res.status(200).send(proyects)).catch(err=>console.log(err));
    } else{
        sequelize.query('SELECT * FROM productos', {type: sequelize.QueryTypes.SELECT})
        .then(proyects=>res.status(200).send(proyects))
            .catch(err=>console.log(err));
    }
})

app.post('/productos', (req, res)=>{
    let {id_producto, nombre, precio} = req.body;
    sequelize.query('INSERT INTO productos (id_producto, nombre, precio) VALUES (?, ?, ?)', {replacements: [id_producto, nombre, precio]})
        .then(proyects=> res.status(200).send({status:'OK', mensaje:'Producto agregado exitosamente'})).catch(err=>console.log(err));
})

app.delete('/productos', (req, res)=>{
    let {nombre} = req.body;
    sequelize.query('DELETE FROM productos WHERE nombre = ?', {replacements: [nombre]})
        .then(proyects => res.status(200).send({status:'OK', mensaje:'Producto eliminado exitosamente'}))
            .catch(err=>console.log(err));
})


app.put('/productos', (req, res)=>{
    let{nombre, campo, nuevo_valor} = req.body;
    sequelize.query(`UPDATE productos SET ${campo} = ? WHERE nombre = ?`, {replacements: [nuevo_valor, nombre]})
        .then(proyects=> res.status(200).send({status:'OK', mensaje:'Modificacion realizada con éxito'})).catch(err=>console.log(err));
})
//////////////////////////////////////////ENDPOINT PEDIDOS

app.get('/pedidos', (req, res)=>{
    let {id_pedido} = req.body;
    if(id_pedido){
        sequelize.query('SELECT * FROM pedidos WHERE id_pedido = ?', {replacements: [id_pedido]})
            .then(proyects=> res.status(200).send(proyects)).catch(err=>console.log(err));
    } else{
        sequelize.query('SELECT * FROM pedidos', {type: sequelize.QueryTypes.SELECT})
        .then(proyects=> res.status(200).send(proyects)).catch(err=>console.log(err));
    }
});

app.post('/pedidos', (req, res)=>{
    let {estado, hora, id_pedido, descripcion, pago, usuario_id, direccion} = req.body;
    sequelize.query('INSERT INTO pedidos (estado, hora, id_pedido, descripcion, pago, usuario_id, direccion) VALUES (?, ?, ?, ?, ?, ?, ?)', {replacements: [estado, hora, id_pedido, descripcion, pago, usuario_id, direccion]}) 
        .then(proyects=> res.status(200).send({status:'OK', mensaje:'Pedido agregado exitosamente'}))
            .catch(err=>console.log(err));
})

app.put('/pedidos', (req, res)=>{
    let{id_pedido, descripcion, pago, direccion} = req.body;
    sequelize.query('')
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
