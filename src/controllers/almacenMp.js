import AlmacenMp from '../models/almacenMp'
import mail from '../services/mail';
import { Types } from 'mongoose'


let add = async (req, res, next) => {
    const { codigo, descripcion, ubicacion } = req.body;
    try {
        const data = await AlmacenMp.create({
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

let addMateriaPrima = async (req, res, next) => {
    const { idAlmacenMp, stock, stockMinimo, idMateriaPrima, detalle, fecha } = req.body;
    try {
        const almacen = await AlmacenMp.findOne({ _id: idAlmacenMp, status: true });
        if (!almacen){
            return res.status(404).send({
                message: 'No se encontró el almacén'
            })
        }
        const movimientos = { cantidad: stock, detalle, fecha };
        if (almacen.materiasPrimas.length !== 0) {
            for (let i = 0; i < almacen.materiasPrimas.length; i++) {
                if (almacen.materiasPrimas[i].materiaPrima.toString() === idMateriaPrima && almacen.materiasPrimas[i].status) {
                    almacen.materiasPrimas[i].stock += stock;
                    almacen.materiasPrimas[i].movimientos.push(movimientos);
                    const data = await AlmacenMp.findByIdAndUpdate({ _id: idAlmacenMp }, { materiasPrimas: almacen.materiasPrimas });
                    return res.status(200).json(data);
                }
                else if (i === almacen.materiasPrimas.length - 1) {
                    almacen.materiasPrimas.push({ stock, stockMinimo, materiaPrima: idMateriaPrima, movimientos: [movimientos] })
                    const data = await AlmacenMp.findByIdAndUpdate({ _id: idAlmacenMp }, { materiasPrimas: almacen.materiasPrimas });
                    return res.status(200).json(data);
                }
            }
        }
        else {
            almacen.materiasPrimas.push({ stock, stockMinimo, materiaPrima: idMateriaPrima, movimientos: [movimientos] })
            const data = await AlmacenMp.findByIdAndUpdate({ _id: idAlmacenMp }, { materiasPrimas: almacen.materiasPrimas });
            return res.status(200).json(data);
        }

    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getAll = async (req, res, next) => {
    try {
        const data = await AlmacenMp.find({ status: true });
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
        const total = await AlmacenMp.find({ status: true })
        const data = await AlmacenMp.find({ status: true }).skip((page - 1) * limit).limit(limit)
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
        const data = await AlmacenMp.findOne({ _id: id }).populate('productos.producto');
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
        const data = await AlmacenMp.findByIdAndUpdate({ _id: id }, {
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
        const data = await AlmacenMp.findByIdAndUpdate({ _id: id }, {
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
    addMateriaPrima,
    getAll,
    getAllPaginate,
    getById,
    update,
    remove,
}