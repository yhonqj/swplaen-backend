import Orden from '../models/orden'
import AlmacenMp from '../models/almacenMp'
import { Types } from 'mongoose'

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
        console.log(e)
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
        const total = await Orden.find({ status: true });
        const data = await Orden.aggregate([
            {
                '$match': {
                    'status': true
                }
            }, {
                '$unwind': '$materiasPrimas'
            }, {
                '$group': {
                    '_id': '$_id',
                    'total': {
                        '$sum': {
                            '$multiply': [
                                '$materiasPrimas.precio', '$materiasPrimas.cantidad'
                            ]
                        }
                    },
                    'observacion': {
                        '$first': '$observacion'
                    },
                    'estadoOrden': {
                        '$first': '$estadoOrden'
                    },
                    'fechaEntrega': {
                        '$first': '$fechaEntrega'
                    },
                    'proveedor': {
                        '$first': '$proveedor'
                    }
                }
            }, {
                '$lookup': {
                    'from': 'proveedor',
                    'localField': 'proveedor',
                    'foreignField': '_id',
                    'as': 'proveedor'
                }
            }, {
                '$project': {
                    'total': '$total',
                    'observacion': '$observacion',
                    'estadoOrden': '$estadoOrden',
                    'fechaEntrega': '$fechaEntrega',
                    'proveedor': {
                        '$first': '$proveedor'
                    }
                }
            }, {
                '$lookup': {
                    'from': 'usuario',
                    'localField': 'proveedor.usuario',
                    'foreignField': '_id',
                    'as': 'proveedor'
                }
            }, {
                '$project': {
                    'total': '$total',
                    'observacion': '$observacion',
                    'estadoOrden': '$estadoOrden',
                    'fechaEntrega': '$fechaEntrega',
                    'proveedor': {
                        '$concat': [
                            {
                                '$first': '$proveedor.apellidos'
                            }, ' ', {
                                '$first': '$proveedor.nombres'
                            }
                        ]
                    }
                }
            }, {
                '$limit': Number(limit)
            }, {
                '$skip': (page - 1) * limit
            }
        ])
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
        const data = await Orden.findByIdAndUpdate({ _id: id }, { estadoOrden: 2 });
        return res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let aceptar = async (req, res, next) => {
    const { id, fechaEntrega } = req.body
    try {
        const orden = await Orden.findOne({ _id: id, status: true });
        // if (orden.estadoOrden === 3) {
        //     return res.status(500).send({
        //         message: "Esta orden ya ha sido aceptada"
        //     })
        // }
        const almacenes = await AlmacenMp.aggregate([
            {
                '$match': {
                    'status': true
                }
            },
            {
                '$unwind': '$materiasPrimas'
            }, {
                '$group': {
                    '_id': '$_id',
                    'total': {
                        '$sum': {
                            '$add': [
                                '$materiasPrimas.stock'
                            ]
                        }
                    },
                    'capacidad': { $first: '$capacidad' },
                    'materiasPrimas': { $push: '$materiasPrimas' }
                }
            }
        ]);
        let j = 0;
        let error = false;
        for (let i = 0; i < almacenes.length; i++) {
            let total = almacenes[i].total;
            let ordenes = (await Orden.aggregate([
                {
                    '$match': {
                        'estadoOrden': 3,
                        'status': true
                    }
                }, {
                    '$unwind': '$materiasPrimas'
                }, {
                    '$match': {
                        'materiasPrimas.almacen': new Types.ObjectId(almacenes[i]._id)
                    }
                }, {
                    '$group': {
                        '_id': '$materiasPrimas.almacen',
                        'total': {
                            '$sum': '$materiasPrimas.cantidad'
                        }
                    }
                }
            ]));

            if (ordenes.length !== 0) {
                total += ordenes[0].total;
            }
            if (j < orden.materiasPrimas.length) {
                for (let k = j; k < orden.materiasPrimas.length; k++) {
                    total += orden.materiasPrimas[j].cantidad;
                    if (total <= almacenes[i].capacidad) {
                        orden.materiasPrimas[j].almacen = almacenes[i]._id;
                        j++;
                    }
                    else if (i === almacenes.length - 1) {
                        error = true;
                        break;
                    } else {
                        break;
                    }
                }
            }

            if (error) {
                return res.status(500).send({
                    message: "Los almacenes se quedaron sin capacidad"
                })
            }
            if (j === orden.materiasPrimas.length) {
                const fecha = new Date(fechaEntrega)
                const data = await Orden.findByIdAndUpdate({ _id: id }, { estadoOrden: 3, materiasPrimas: orden.materiasPrimas, fechaEntrega: fecha });
                return res.status(200).json(data);
            }
        }



    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let completar = async (req, res, next) => {
    const { id } = req.body
    try {
        const orden = await Orden.findOne({ _id: id });
        for (let i = 0; i < orden.materiasPrimas.length; i++) {
            const almacen = await AlmacenMp.findOne({ _id: orden.materiasPrimas[i].almacen });
            const materiaPrima = orden.materiasPrimas[i];
            const movimientos = { cantidad: materiaPrima.cantidad };
            if (almacen.materiasPrimas.length !== 0) {
                for (let j = 0; j < almacen.materiasPrimas.length; j++) {
                    if (almacen.materiasPrimas[j].materiaPrima.toString() === materiaPrima.materiaPrima.toString() && almacen.materiasPrimas[j].status) {
                        almacen.materiasPrimas[j].stock += materiaPrima.cantidad;
                        almacen.materiasPrimas[j].movimientos.push(movimientos);
                    }
                    else if (almacen.materiasPrimas[j].materiaPrima.toString() === materiaPrima.materiaPrima.toString() && almacen.materiasPrimas[j].status && j === almacen.materiasPrimas.length - 1) {
                        almacen.materiasPrimas.push({ stock: materiaPrima.cantidad, materiaPrima: materiaPrima.materiaPrima, movimientos: [movimientos] });
                    }
                }
            }
            else {
                almacen.materiasPrimas.push({ stock: materiaPrima.cantidad, materiaPrima: materiaPrima.materiaPrima, movimientos: [movimientos] });
            }
            await AlmacenMp.findByIdAndUpdate({ _id: almacen._id }, { materiasPrimas: almacen.materiasPrimas });
        }
        const data = await Orden.findByIdAndUpdate({ _id: id }, { estadoOrden: 4 });
        return res.status(200).json(data);
    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let reprogramar = async (req, res, next) => {
    const { id } = req.body
    try {
        const data = await Orden.findByIdAndUpdate({ _id: id }, { estadoOrden: 5 });
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