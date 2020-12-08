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

/*app.get('/usuarios', (req, res)=>{
    sequelize.query("SELECT * FROM usuarios", {type: sequelize.QueryTypes.SELECT})
    .then(proyects=>
        res.status(200).send(proyects))
})*/

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
