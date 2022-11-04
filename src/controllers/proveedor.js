import Usuario from '../models/usuario'
import Proveedor from '../models/proveedor'
import helpers from './helpers'
import { Types } from 'mongoose'

let add = async (req, res, next) => {
  const { nombres, apellidos, correo, celular, dni, ruc, razonSocial, direccion, referencia, codigoPostal } = req.body;
  const password = await helpers.encryptPassword("pinga");
  try {
    let usuario = await Usuario.findOne({ correo });
    if (usuario){
      return res.status(500).send({
        message: "Ya existe este correo en el sistema"
      })
    }

    let proveedor = await Proveedor.findOne({ dni });
    if (proveedor){
      return res.status(500).send({
        message: "Ya existe un proveedor con este dni"
      })
    }

    proveedor = await Proveedor.findOne({ ruc });
    if (proveedor){
      return res.status(500).send({
        message: "Ya existe un proveedor con este ruc"
      })
    }

    const data = await Usuario.create({
      nombres,
      apellidos,
      correo,
      celular,
      password,
      tipoUsuario: 3
    })
    await Proveedor.create({
      dni,
      ruc,
      razonSocial,
      direccion,
      referencia,
      codigoPostal,
      usuario: data._id
    })
    return res.status(200).json(data);
  } catch (e) {
    console.log(e)
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let addMateriaPrima = async (req, res, next) => {
  const { cantidad, precio, idMateriaPrima, idProveedor } = req.body;
  try {
    const proveedor = await Proveedor.findOne({ _id: idProveedor, status: true });
    if (proveedor.materiasPrimas.length !== 0) {
      for (let i = 0; i < proveedor.materiasPrimas.length; i++) {
        if (proveedor.materiasPrimas[i].materiaPrima.toString() === idMateriaPrima && proveedor.materiasPrimas[i].status) {
          proveedor.materiasPrimas[i].cantidad += cantidad;
          const data = await Proveedor.findByIdAndUpdate({ _id: idProveedor }, { materiasPrimas: proveedor.materiasPrimas });
          return res.status(200).json(data);
        }
        else if (i === (proveedor.materiasPrimas.length - 1)) {
          proveedor.materiasPrimas.push({ cantidad, precio, materiaPrima: idMateriaPrima });
          const data = await Proveedor.findByIdAndUpdate({ _id: idProveedor }, { materiasPrimas: proveedor.materiasPrimas });
          return res.status(200).json(data);
        }
      }
    }
    else {
      proveedor.materiasPrimas.push({ cantidad, precio, materiaPrima: idMateriaPrima });
      const data = await Proveedor.findByIdAndUpdate({ _id: idProveedor }, { materiasPrimas: proveedor.materiasPrimas });
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
    const data = await Proveedor.aggregate([
      {
        '$match': {
          'status': true
        }
      }, {
        '$lookup': {
          'from': 'usuario',
          'localField': 'usuario',
          'foreignField': '_id',
          'as': 'usuario'
        }
      }, {
        '$project': {
          'nombres': {
            '$first': '$usuario.nombres'
          },
          'apellidos': {
            '$first': '$usuario.apellidos'
          },
          'correo': {
            '$first': '$usuario.correo'
          },
          'celular': {
            '$first': '$usuario.celular'
          },
          'dni': '$dni',
          'ruc': '$ruc',
          'razonSocial': '$razonSocial',
          'direccion': '$direccion',
          'referencia': '$referencia',
          'codigoPostal': '$codigoPostal'
        }
      }
    ]);
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
    const total = await Proveedor.find({ status: true });
    const data = await Proveedor.aggregate([
      {
        '$match': {
          'status': true
        }
      }, {
        '$lookup': {
          'from': 'usuario',
          'localField': 'usuario',
          'foreignField': '_id',
          'as': 'usuario'
        }
      }, {
        '$project': {
          'nombres': {
            '$first': '$usuario.nombres'
          },
          'apellidos': {
            '$first': '$usuario.apellidos'
          },
          'correo': {
            '$first': '$usuario.correo'
          },
          'celular': {
            '$first': '$usuario.celular'
          },
          'dni': '$dni',
          'ruc': '$ruc',
          'razonSocial': '$razonSocial',
          'direccion': '$direccion',
          'referencia': '$referencia',
          'codigoPostal': '$codigoPostal'
        }
      }, {
        '$limit': Number(limit)
      }, {
        '$skip': ((page - 1) * limit)
      }
    ]);
    return res.status(200).json({ results: data, total: total.length, totalPages: Math.ceil(total.length / limit) });
  } catch (e) {
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let getMateriasPrimasById = async (req, res, next) => {
  const { id } = req.query;
  try {
    const data = await Proveedor.aggregate([
      {
        '$match': {
          '_id': new Types.ObjectId(id),
          'status': true
        }
      }, {
        '$unwind': '$materiasPrimas'
      }, {
        '$match': {
          'materiasPrimas.status': true
        }
      }, {
        '$project': {
          'materiaPrima': '$materiasPrimas.materiaPrima',
          'cantidad': '$materiasPrimas.cantidad',
          'precio': '$materiasPrimas.precio'
        }
      }, {
        '$lookup': {
          'from': 'materiaPrima',
          'localField': 'materiaPrima',
          'foreignField': '_id',
          'as': 'materiaPrima'
        }
      }, {
        '$project': {
          'nombre': {
            '$first': '$materiaPrima.nombre'
          },
          'descripcion': {
            '$first': '$materiaPrima.descripcion'
          },
          'foto': {
            '$first': '$materiaPrima.foto'
          },
          'cantidad': '$cantidad',
          'precio': '$precio',
          'categoriaMateriaPrima': {
            '$first': '$materiaPrima.categoriaMateriaPrima'
          }
        }
      }, {
        '$lookup': {
          'from': 'categoriaMateriaPrima',
          'localField': 'categoriaMateriaPrima',
          'foreignField': '_id',
          'as': 'categoriaMateriaPrima'
        }
      }, {
        '$project': {
          'nombre': '$nombre',
          'descripcion': '$descripcion',
          'foto': '$foto',
          'cantidad': '$cantidad',
          'precio': '$precio',
          'categoriaMateriaPrima': {
            '$first': '$categoriaMateriaPrima.nombre'
          }
        }
      }
    ]);
    return res.status(200).json(data);
  } catch (e) {
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let getMateriasPrimasByIdPaginate = async (req, res, next) => {
  const { id, limit, page } = req.query;
  try {
    const proveedor = await Proveedor.findOne({ _id: id, status: true });
    let total = 0;
    for (let i = 0; i < proveedor.materiasPrimas.length; i++) {
      if (proveedor.materiasPrimas[i].status) {
        total++;
      }
    }
    const data = await Proveedor.aggregate([
      {
        '$match': {
          '_id': new Types.ObjectId(id),
          'status': true
        }
      }, {
        '$unwind': '$materiasPrimas'
      }, {
        '$match': {
          'materiasPrimas.status': true
        }
      }, {
        '$project': {
          'materiaPrima': '$materiasPrimas.materiaPrima',
          'cantidad': '$materiasPrimas.cantidad',
          'precio': '$materiasPrimas.precio'
        }
      }, {
        '$lookup': {
          'from': 'materiaPrima',
          'localField': 'materiaPrima',
          'foreignField': '_id',
          'as': 'materiaPrima'
        }
      }, {
        '$project': {
          'nombre': {
            '$first': '$materiaPrima.nombre'
          },
          'descripcion': {
            '$first': '$materiaPrima.descripcion'
          },
          'foto': {
            '$first': '$materiaPrima.foto'
          },
          'cantidad': '$cantidad',
          'precio': '$precio',
          'categoriaMateriaPrima': {
            '$first': '$materiaPrima.categoriaMateriaPrima'
          }
        }
      }, {
        '$lookup': {
          'from': 'categoriaMateriaPrima',
          'localField': 'categoriaMateriaPrima',
          'foreignField': '_id',
          'as': 'categoriaMateriaPrima'
        }
      }, {
        '$project': {
          'nombre': '$nombre',
          'descripcion': '$descripcion',
          'foto': '$foto',
          'cantidad': '$cantidad',
          'precio': '$precio',
          'categoriaMateriaPrima': {
            '$first': '$categoriaMateriaPrima.nombre'
          }
        }
      }, {
        '$limit': Number(limit)
      }, {
        '$skip': (page - 1) * limit
      }
    ]);
    return res.status(200).json({ results: data, total, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let getById = async (req, res, next) => {
  let id = req.query.id;
  try {
    const data = await Proveedor.findOne({ _id: id });
    return res.status(200).json(data);
  } catch (e) {
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let update = async (req, res, next) => {
  const id = req.body._id;
  const { dni, ruc, razonSocial, direccion, referencia, codigoPostal } = req.body;
  try {
    const data = await Proveedor.findByIdAndUpdate({ _id: id }, {
      dni,
      ruc,
      razonSocial,
      direccion,
      referencia,
      codigoPostal
    })
    res.status(200).json(data);
  } catch (e) {
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let remove = async (req, res, next) => {
  const id = req.body.id;
  try {
      const data = await Proveedor.findByIdAndUpdate({ _id: id }, {
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
  getMateriasPrimasById,
  getMateriasPrimasByIdPaginate,
  getById,
  update,
  remove
}