DelilahResto
Proyecto Delilah Restó

API para restaurante/tienda de comidas. Los usuarios podran registrarse, loguearse, solicitar una lista de productos y hacer un pedido. Solo el usuario administrador podrá realizar las operaciones de edicion del estado de los pedidos, consulta y eliminación de los mismos. También este podrá crear, consultar, eliminar y actualizar productos.

Requisitos
Instalar NodeJS
Nodejs es un entorno JavaScript que nos permite ejecutar en el servidor, de manera asíncrona, con una arquitectura orientada a eventos y basado en el motor V8 de Google.

https://nodejs.org/en/download/

Instalar XAMPP
XAMPP es una distribución de Apache completamente gratuita y fácil de instalar que contiene MariaDB, PHP y Perl.

https://www.apachefriends.org/es/download.html

Instalar Postman
Es una herramienta que principalmente nos permite crear peticiones sobre APIs de una forma muy sencilla y poder, de esta manera, probar las APIs

https://www.postman.com/product/api-client/

Despliegue
1) Clonar el proyecto
    Clonar el repositorio desde github accediendo al link: https://github.com/KevinYaguar/delilah-resto.git
    Desde la consola ejecutar el comando:
    git clone https://github.com/seba365/DelilahResto.git

2) Instalar dependencias:
npm install cors
npm install dotenv
npm install express
npm install express-jwt
npm install jsonwebtoken
npm install mysql2
npm install sequelize

3) Creando base de datos

Abrir XAMPP e iniciar los servicios de Apache y MYSQL
Para abrir MYSQL presionar el botón Admin ó acceder a phpmyadmin.
Generar la base de datos delilahresto, dentro del panle de control de la base de datos ejecutar y/o importar el archivo que se encuentra en: instrucciones_mysql.txt

Dentro de index.js se encuentra el objecto "administrador" el cual tiene las propiedades usuario y contraseña. Ahi ingrese el usuario y contraseña que desee que quede guardado para las peticiones que solo son adminitas por el administrador. Solo será accedible en el script. 

Documentación de la API
Abrir el archivo swagger.yaml y copiar su contenido en Swagger o importar el mismo desde las opciones.

Testing
Testear los endpoints provistos desde postman para poder hacer uso de la API y base de datos generadas.

Recursos y tecnologías utilizadas
Node
Postman
XAMPP
Swagger
NPM PACKAGES:
Express
Nodemon
Jsonwebtoken
Dotenv
Mysql
Moment
Cors

Autor
Kevin Yaguar -  https://github.com/KevinYaguar