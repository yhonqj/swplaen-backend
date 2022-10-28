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
    getAll,
    getAllPaginate,
    getById,
    update,
    remove,
}