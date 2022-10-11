import Almacen from '../models/almacen'
import mail from '../services/mail';

let add = async (req, res, next) => {
    const { codigo, descripcion, ubicacion } = req.body;
    try {
        const data = await Almacen.create({
            codigo,
            descripcion,
            ubicacion
        })
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getProductoById = async (req, res, next) => {
    const {id, idProducto} = req.query;
    try {
        const data = await Almacen.findOne({ _id: id, 'productos.producto': idProducto, 'productos.status': true }).populate('productos.producto');
        res.status(200).json({ nombre: data.productos[0].producto.nombre, stock: data.productos[0].stock, stockMinimo: data.productos[0].stockMinimo});
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let addProducto = async (req, res, next) => {
    const { idAlmacen, stock, stockMinimo, idProducto, detalle, fecha } = req.body;
    try {
        const almacen = await Almacen.findOne({ _id: idAlmacen, status: true });
        if (!almacen){
            return res.status(404).send({
                message: 'No se encontró el almacén'
            })
        }
        const movimientos = { cantidad: stock, detalle, fecha };
        if (almacen.productos.length !== 0) {
            for (let i = 0; i < almacen.productos.length; i++) {
                if (almacen.productos[i].producto.toString() === idProducto && almacen.productos[i].status) {
                    almacen.productos[i].stock += stock;
                    almacen.productos[i].movimientos.push(movimientos);
                    const data = await Almacen.findByIdAndUpdate({ _id: idAlmacen }, { productos: almacen.productos });
                    return res.status(200).json(data);
                }
                else if (almacen.productos[i].producto.toString() !== idProducto && almacen.productos[i].status && (i === almacen.productos.length - 1)) {
                    almacen.productos.push({ stock, stockMinimo, producto: idProducto, movimientos: [movimientos] })
                    const data = await Almacen.findByIdAndUpdate({ _id: idAlmacen }, { productos: almacen.productos });
                    return res.status(200).json(data);
                }
            }
        }
        else {
            almacen.productos.push({ stock, stockMinimo, producto: idProducto, movimientos: [movimientos] })
            const data = await Almacen.findByIdAndUpdate({ _id: idAlmacen }, { productos: almacen.productos });
            return res.status(200).json(data);
        }

    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let updateProducto = async (req, res, next) => {
    const { idAlmacen, idProducto, stockMinimo } = req.body;
    try {
        const almacen = await Almacen.findOne({ _id: idAlmacen, status: true });
        if (!almacen){
            return res.status(404).send({
                message: 'No se encontró el almacén'
            })
        }
        for (let i = 0; i < almacen.productos.length; i++) {
            if (almacen.productos[i].producto.toString() === idProducto && almacen.productos[i].status) {
                almacen.productos[i].stockMinimo = stockMinimo;
                const data = await Almacen.findByIdAndUpdate({ _id: idAlmacen }, { productos: almacen.productos });
                return res.status(200).json(data);
            }
            else if (almacen.productos[i].producto.toString() !== idProducto && almacen.productos[i].status && (i === almacen.productos.length - 1)) {
                return res.status(404).send({
                    message: 'No se encontró el producto en el almacén'
                })
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let removeProducto = async (req, res, next) => {
    const { idProducto, idAlmacen } = req.body;
    try {
        const almacen = await Almacen.findOne({ _id: idAlmacen, status: true });
        for (let i = 0; i < almacen.productos.length; i++) {
            if (almacen.productos[i].producto.toString() === idProducto && almacen.productos[i].status) {
                almacen.productos[i].producto.status = false;
                const data = await Almacen.findByIdAndUpdate({ _id: idAlmacen }, { productos: almacen.productos });
                return res.status(200).json(data);
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getAll = async (req, res, next) => {
    try {
        const data = await Almacen.find({ status: true });
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
        const total = await Almacen.find({ status: true })
        const data = await Almacen.find({ status: true }).skip((page - 1) * limit).limit(limit)
        res.status(200).json({ results: data, total: total.length, totalPages: Math.ceil(total.length / limit) });
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getById = async (req, res, next) => {
    let id = req.query.id;
    try {
        const data = await Almacen.findOne({ _id: id }).populate('productos.producto');
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let update = async (req, res, next) => {
    const id = req.body._id;
    const { codigo, descripcion, ubicacion } = req.body;
    try {
        const data = await Almacen.findByIdAndUpdate({ _id: id }, {
            codigo,
            descripcion,
            ubicacion
        })
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let remove = async (req, res, next) => {
    const id = req.body._id;
    try {
        const data = await Almacen.findByIdAndUpdate({ _id: id }, {
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
    getProductoById,
    getAll,
    getAllPaginate,
    getById,
    update,
    remove,
    addProducto,
    updateProducto,
    removeProducto
}