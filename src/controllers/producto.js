import Almacen from '../models/almacen';
import Tienda from '../models/tienda';
import Producto from '../models/producto'

let add = async (req, res, next) => {
    const { nombre, descripcion, foto, categoriaProducto } = req.body;
    try {
        const product = await Producto.findOne({ nombre, status: true });
        if (product) {
            if (product.nombre === nombre) {
                res.status(500).send({
                    message: "Ya existe un producto con ese nombre"
                })
            }
            else {
                const data = await Producto.create({
                    nombre,
                    descripcion,
                    foto,
                    categoriaProducto,
                })
                res.status(200).json(data);
            }
        }
        else {
            const data = await Producto.create({
                nombre,
                descripcion,
                foto,
                categoriaProducto
            })
            res.status(200).json(data);
        }

    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getAll = async (req, res, next) => {
    try {
        const data = await Producto.find({ status: true });
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getAllPaginate = async (req, res, next) => {
    const { limit, page } = req.query;
    try {
        const total = await Producto.find({ status: true });
        let data = await Producto.find({ status: true }).skip((page - 1) * limit).limit(limit);
        for (let i = 0; i< data.length; i++) {
            let stock = 0;
            data[i] = data[i].toObject();
            const productoEnAlmacen = await Almacen.aggregate([
                {
                    '$unwind': {
                        'path': '$productos'
                    }
                }, {
                    '$match': {
                        'productos.producto': data[i]._id,
                        'status': true
                    }
                }
            ]);
            
            productoEnAlmacen.forEach((item) => {
                stock += item.productos.stock;
            })
            const productoEnTienda = await Tienda.aggregate([
                {
                    '$unwind': {
                        'path': '$productos'
                    }
                }, {
                    '$match': {
                        'productos.producto': data[i]._id,
                        'status': true
                    }
                }
            ]);
            
            productoEnTienda.forEach((item) => {
                stock += item.productos.stock;
            })
            data[i].stock = stock;
        };

        return res.status(200).json({ results: data, total: total.length, totalPages: Math.ceil(total.length / limit) });
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getById = async (req, res, next) => {
    let id = req.query.id;
    try {
        const data = await Producto.findOne({ _id: id });
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let update = async (req, res, next) => {
    const id = req.body._id;
    const { nombre, descripcion, foto, categoriaProducto } = req.body;
    try {
        const product = await Producto.findOne({ nombre, status: true });
        if (product) {
            if (product.nombre === nombre) {
                res.status(500).send({
                    message: "Ya existe un producto con ese nombre"
                })
            }
            else {
                const data = await Producto.findByIdAndUpdate({ _id: id }, {
                    nombre,
                    descripcion,
                    foto,
                    categoriaProducto
                })
                res.status(200).json(data);
            }
        }
        else {
            const data = await Producto.findByIdAndUpdate({ _id: id }, {
                nombre,
                descripcion,
                foto,
                categoriaProducto
            })
            res.status(200).json(data);
        }
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let remove = async (req, res, next) => {
    const id = req.body.id;
    try {
        const data = await Producto.findByIdAndUpdate({ _id: id }, {
            status: false
        })
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

export default {
    add,
    getAll,
    getAllPaginate,
    getById,
    update,
    remove
}