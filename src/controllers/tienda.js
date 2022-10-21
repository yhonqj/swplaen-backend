import Tienda from '../models/tienda'
import Almacen from '../models/almacen'
import { Types } from 'mongoose'
/**
  * Registra una tienda.
  *
  * @param {string} direccion Dirección de la tienda.
  * @param {string} referencia Referencia de la dirección.
  * @return Respuesta en formato JSON.
**/
let add = async (req, res, next) => {
    const { direccion, referencia } = req.body;
    try {
        const data = await Tienda.create({
            direccion,
            referencia
        })
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

/**
  * Agrega un producto en la tienda.
  *
  * @param {string} idAlmacen El id del almacén.
  * @param {string} idTienda El id de la tienda.
  * @param {string} idProducto El id del producto.
  * @param {string} detalle Detalle del movimiento.
  * @param {date} fecha Fecha del movimiento.
  * @param {number} cantidad La cantidad debe ser mayor a cero.
  * @param {number} precio El precio debe ser mayor a cero.
  * @param {number} descuento El descuento debe ser mayor o igual a cero.
  * @return Respuesta en formato JSON.
**/
let addProducto = async(req, res, next) => {
    const { idAlmacen, cantidad, idProducto, detalle, fecha, precio, descuento, idTienda } = req.body;
    try {
        const tienda = await Tienda.findOne({ _id: idTienda, status: true });
        const almacen = await Almacen.findOne({ _id: idAlmacen, status: true });
        if (!tienda){
            return res.status(404).send({
                message: 'No se encontró la tienda'
            })
        }
        if (!almacen){
            return res.status(404).send({
                message: 'No se encontró el almacén'
            })
        }
        const movimientos = { cantidad, detalle, fecha };
        for (let i = 0; i < almacen.productos.length; i++) {
            if (almacen.productos[i].producto.toString() === idProducto && almacen.productos[i].status) {
                almacen.productos[i].stock -= cantidad;
                if (almacen.productos[i].stock < 0){
                    return res.status(500).send({
                        message: 'El stock no puede ser menor a cero'
                    })
                }
                if (almacen.productos[i].stock < almacen.productos[i].stockMinimo){
                    // Notificación al correo
                }
                almacen.productos[i].movimientos.push(movimientos);
                await Almacen.findByIdAndUpdate({ _id: idAlmacen }, { productos: almacen.productos });
            }
            else if (almacen.productos[i].producto.toString() !== idProducto && almacen.productos[i].status && (i === almacen.productos.length - 1)) {
                return res.status(404).send({
                    message: 'No se encontró el producto en el almacén'
                })
            }
        }
        
        if (tienda.productos.length !== 0) {
            for (let i = 0; i < tienda.productos.length; i++) {
                if (tienda.productos[i].producto.toString() === idProducto && tienda.productos[i].status) {
                    tienda.productos[i].stock += cantidad;
                    const data = await Tienda.findByIdAndUpdate({ _id: idTienda }, { productos: tienda.productos });
                    return res.status(200).json(data);
                }
                else if (tienda.productos[i].producto.toString() !== idProducto && tienda.productos[i].status && (i === tienda.productos.length - 1)) {
                    tienda.productos.push({ stock: cantidad, precio, descuento, producto: idProducto })
                    const data = await Tienda.findByIdAndUpdate({ _id: idTienda }, { productos: tienda.productos });
                    return res.status(200).json(data);
                }
            }
        }
        else {
            tienda.productos.push({ stock: cantidad, precio, descuento, producto: idProducto })
            const data = await Tienda.findByIdAndUpdate({ _id: idTienda }, { productos: tienda.productos });
            return res.status(200).json(data);
        }

    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

/**
  * Actualiza los datos del producto en la tienda.
  *
  * @param {string} idTienda El id de la tienda.
  * @param {string} idProducto El id del producto.
  * @param {number} precio El precio debe ser mayor a cero.
  * @param {number} descuento El descuento debe ser mayor o igual a cero.
  * @param {boolean} disponible Disponibilidad del producto en la tienda.
  * @return Respuesta en formato JSON.
**/
let updateProducto = async (req, res, next) => {
    const { idTienda, idProducto, precio, descuento, disponible } = req.body;
    try {
        const tienda = await Tienda.findOne({ _id: idTienda, status: true });
        if (!tienda){
            return res.status(404).send({
                message: 'No se encontró la tienda'
            })
        }
        for (let i = 0; i < tienda.productos.length; i++) {
            if (tienda.productos[i].producto.toString() === idProducto && tienda.productos[i].status) {
                tienda.productos[i].precio = precio;
                tienda.productos[i].descuento = descuento;
                tienda.productos[i].disponible = disponible;
                const data = await Tienda.findByIdAndUpdate({ _id: idTienda }, { productos: tienda.productos });
                return res.status(200).json(data);
            }
            else if (tienda.productos[i].producto.toString() !== idProducto && tienda.productos[i].status && (i === tienda.productos.length - 1)) {
                return res.status(404).send({
                    message: 'No se encontró el producto en la tienda'
                })
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

/**
  * Lista las tiendas.
  *
  * @return Respuesta en formato JSON.
**/
let getAll = async (req, res, next) => {
    try {
        const data = await Tienda.find({ status: true });
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

/**
  * Lista las tiendas con paginado.
  *
  * @param {number} limit Límite de la paginación.
  * @param {number} page Página.
  * @return Respuesta en formato JSON.
**/
let getAllPaginate = async (req, res, next) => {
    const { limit, page } = req.query;
    try {
        const total = await Tienda.find({ status: true })
        const data = await Tienda.find({ status: true }).skip((page - 1) * limit).limit(limit)
        res.status(200).json({ results: data, total: total.length, totalPages: Math.ceil(total.length / limit) });
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

/**
  * Obtiene una tienda por id.
  *
  * @param {string} id Id de la tienda.
  * @return Respuesta en formato JSON.
**/
let getById = async (req, res, next) => {
    let id = req.query.id;
    try {
        const data = await Tienda.findOne({ _id: id })
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getProductosById = async (req, res, next) => {
    let id = req.query.id;
    try {
        const data = await Tienda.aggregate([
            {
              '$match': {
                '_id': new Types.ObjectId(id), 
                'status': true
              }
            }, {
              '$unwind': '$productos'
            }, {
              '$project': {
                'productos': '$productos'
              }
            }, {
              '$lookup': {
                'from': 'producto', 
                'localField': 'productos.producto', 
                'foreignField': '_id', 
                'as': 'productos.producto'
              }
            }, {
              '$project': {
                'stock': '$productos.stock', 
                'precio': '$productos.precio', 
                'descuento': '$productos.descuento', 
                'disponible': '$productos.disponible', 
                'idProducto': {
                  '$first': '$productos.producto._id'
                }, 
                'nombre': {
                  '$first': '$productos.producto.nombre'
                }, 
                'descripcion': {
                  '$first': '$productos.producto.descripcion'
                }, 
                'foto': {
                  '$first': '$productos.producto.foto'
                }, 
                'categoriaProducto': {
                  '$first': '$productos.producto.categoriaProducto'
                }
              }
            }, {
              '$lookup': {
                'from': 'categoriaProducto', 
                'localField': 'categoriaProducto', 
                'foreignField': '_id', 
                'as': 'categoriaProducto'
              }
            }, {
              '$project': {
                'idProducto': '$idProducto', 
                'stock': '$stock', 
                'precio': '$precio', 
                'descuento': '$descuento', 
                'disponible': '$disponible', 
                'nombre': '$nombre', 
                'descripcion': '$descripcion', 
                'foto': '$foto', 
                'categoriaProducto': {
                  '$first': '$categoriaProducto.nombre'
                }, 
                'idCategoriaProducto': {
                  '$first': '$categoriaProducto._id'
                }
              }
            }
          ]);

          return res.status(200).json({data});
    } catch (e){
        console.log(e)
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getProductosByIdPaginate = async (req, res, next) => {
    let { id, limit, page } = req.query;
    try {
        const tienda = await Tienda.findOne({_id: id, status: true});
        let total = 0;
        for (let i = 0; i < tienda.productos.length; i++){
            if (tienda.productos[i].status){
                total++;
            }
        }
        const data = await Tienda.aggregate([
            {
              '$match': {
                '_id': new Types.ObjectId(id), 
                'status': true
              }
            }, {
              '$unwind': '$productos'
            }, {
              '$project': {
                'productos': '$productos'
              }
            }, {
              '$lookup': {
                'from': 'producto', 
                'localField': 'productos.producto', 
                'foreignField': '_id', 
                'as': 'productos.producto'
              }
            }, {
              '$project': {
                'stock': '$productos.stock', 
                'precio': '$productos.precio', 
                'descuento': '$productos.descuento', 
                'disponible': '$productos.disponible', 
                'idProducto': {
                  '$first': '$productos.producto._id'
                }, 
                'nombre': {
                  '$first': '$productos.producto.nombre'
                }, 
                'descripcion': {
                  '$first': '$productos.producto.descripcion'
                }, 
                'foto': {
                  '$first': '$productos.producto.foto'
                }, 
                'categoriaProducto': {
                  '$first': '$productos.producto.categoriaProducto'
                }
              }
            }, {
              '$lookup': {
                'from': 'categoriaProducto', 
                'localField': 'categoriaProducto', 
                'foreignField': '_id', 
                'as': 'categoriaProducto'
              }
            }, {
              '$project': {
                'idProducto': '$idProducto', 
                'stock': '$stock', 
                'precio': '$precio', 
                'descuento': '$descuento', 
                'disponible': '$disponible', 
                'nombre': '$nombre', 
                'descripcion': '$descripcion', 
                'foto': '$foto', 
                'categoriaProducto': {
                  '$first': '$categoriaProducto.nombre'
                }, 
                'idCategoriaProducto': {
                  '$first': '$categoriaProducto._id'
                }
              }
            }, {
                '$limit': Number(limit)
            }, {
                '$skip': ((page - 1) * limit)
            }
          ]);

          return res.status(200).json({results: data, total, totalPages: Math.ceil(total / limit) });
    } catch (e){
        console.log(e)
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

/**
  * Actualiza una tienda.
  *
  * @param {string} id Id de la tienda.
  * @param {string} direccion Dirección de la tienda.
  * @param {string} referencia Referencia de la dirección.
  * @return Respuesta en formato JSON.
**/
let update = async (req, res, next) => {
    const { direccion, referencia, id } = req.body;
    try {
        const data = await Tienda.findByIdAndUpdate({ _id: id }, {
            direccion,
            referencia,
        })
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

/**
  * Elimina una tienda.
  *
  * @param {string} id Id de la tienda.
  * @return Respuesta en formato JSON.
**/
let remove = async (req, res, next) => {
    const id = req.body.id;
    try {
        const data = await Tienda.findByIdAndUpdate({ _id: id }, {
            status: false
        })
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

export {
    add,
    getAll,
    getAllPaginate,
    getById,
    getProductosById,
    getProductosByIdPaginate,
    update,
    remove,
    addProducto,
    updateProducto
}