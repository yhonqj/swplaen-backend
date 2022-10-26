import Orden from '../models/orden'


let add = async (req, res, next) => {
    const { materiasPrimas, observacion, proveedor } = req.body;
    try {
        const data = await Orden.create({
            materiasPrimas,
            observacion,
            proveedor,
            estadoOrden: 1
        })
        return res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getAll = async (req, res, next) => {
    try {
        const data = await Orden.find({ status: true });
        return res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getAllPaginate = async (req, res, next) => {
    const { limit, page } = req.query;
    try {
        const total = await Orden.find({status: true});
        const data = await Orden.find({ status: true }).skip((page - 1) * limit).limit(limit);
        res.status(200).json({ results: data, total: total.length, totalPages: Math.ceil(total.length / limit) });
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getById = async (req, res, next) => {
    const id = req.query.id
    try {
        const data = await Orden.findOne({ _id: id, status: true });
        return res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let rechazar = async (req, res, next) => {
    const { id } = req.body
    try {
        const data = await Orden.findByIdAndUpdate({ _id: id},{ estadoOrden: 2 });
        return res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let aceptar = async (req, res, next) => {
    const { id } = req.body
    try {
        const data = await Orden.findByIdAndUpdate({ _id: id},{ estadoOrden: 3 });
        return res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let completar = async (req, res, next) => {
    const { id } = req.body
    try {
        const data = await Orden.findByIdAndUpdate({ _id: id},{ estadoOrden: 4, fechaEntrega: Date.now });
        return res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let reprogramar = async (req, res, next) => {
    const { id } = req.body
    try {
        const data = await Orden.findByIdAndUpdate({ _id: id},{ estadoOrden: 5 });
        return res.status(200).json(data);
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
    rechazar,
    aceptar,
    completar,
    reprogramar
}