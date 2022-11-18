import Usuario from '../models/usuario'
import Orden from '../models/orden'
import Proveedor from '../models/proveedor'
import helpers from './helpers'
import tokenServer from '../services/token'
import { Types } from 'mongoose'
import functions from '../utils/functions'
import mail from '../services/mail'

let add = async (req, res, next) => {
  const { nombres, apellidos, correo, celular, dni, ruc, razonSocial, direccion, referencia, codigoPostal } = req.body;
  const pass = functions.generatePasswordRand(16);
  const password = await helpers.encryptPassword(pass);
  try {
    let usuario = await Usuario.findOne({ correo });
    if (usuario){
      return res.status(500).send({
        message: "Ya existe este correo en el sistema"
      })
    }

    usuario = await Usuario.findOne({ dni });
    if (usuario){
      return res.status(500).send({
        message: "Ya existe un proveedor con este dni"
      })
    }

    let proveedor = await Proveedor.findOne({ ruc });
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
      dni,
      tipoUsuario: 3
    })
    await Proveedor.create({
      ruc,
      razonSocial,
      direccion,
      referencia,
      codigoPostal,
      usuario: data._id
    })
    mail.sendEmail(correo,'Contraseña: '+pass)
    return res.status(200).json(data);
  } catch (e) {
    console.log(e)
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let addMateriaPrima = async (req, res, next) => {
  const { token } = req.headers;
  const { cantidad, precio, idMateriaPrima } = req.body;
  try {
    const user = await tokenServer.decode(token);
    const proveedor = await Proveedor.findOne({ usuario: user._id, status: true });
    if (proveedor.materiasPrimas.length !== 0) {
      for (let i = 0; i < proveedor.materiasPrimas.length; i++) {
        if (proveedor.materiasPrimas[i].materiaPrima.toString() === idMateriaPrima && proveedor.materiasPrimas[i].status) {
          proveedor.materiasPrimas[i].cantidad += cantidad;
          const data = await Proveedor.findByIdAndUpdate({ _id: proveedor._id }, { materiasPrimas: proveedor.materiasPrimas });
          return res.status(200).json(data);
        }
        else if (i === (proveedor.materiasPrimas.length - 1)) {
          proveedor.materiasPrimas.push({ cantidad, precio, materiaPrima: idMateriaPrima });
          const data = await Proveedor.findByIdAndUpdate({ _id: proveedor._id }, { materiasPrimas: proveedor.materiasPrimas });
          return res.status(200).json(data);
        }
      }
    }
    else {
      proveedor.materiasPrimas.push({ cantidad, precio, materiaPrima: idMateriaPrima });
      const data = await Proveedor.findByIdAndUpdate({ _id: proveedor._id }, { materiasPrimas: proveedor.materiasPrimas });
      return res.status(200).json(data);
    }
  } catch (e) {
    console.log(e)
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let getMateriaPrimaById = async (req, res, next) => {
  const { token } = req.headers;
  const { idMateriaPrima } = req.query;
  try {
    const user = await tokenServer.decode(token);
    const proveedor = await Proveedor.findOne({ usuario: user._id, status: true });
    const data = (await Proveedor.aggregate([
      {
        '$match': {
          '_id': proveedor._id, 
          'status': true
        }
      }, {
        '$unwind': '$materiasPrimas'
      }, {
        '$match': {
          'materiasPrimas.materiaPrima': new Types.ObjectId(idMateriaPrima), 
          'status': true
        }
      }, {
        '$lookup': {
          'from': 'materiaPrima', 
          'localField': 'materiasPrimas.materiaPrima', 
          'foreignField': '_id', 
          'as': 'materiaPrima'
        }
      }, {
        '$project': {
          'materiaPrima': '$materiasPrimas.materiaPrima', 
          'nombre': {
            '$first': '$materiaPrima.nombre'
          }, 
          'cantidad': '$materiasPrimas.cantidad', 
          'precio': '$materiasPrimas.precio'
        }
      }
    ])).find(c => c.materiaPrima.toString() === idMateriaPrima)
    return res.status(200).json(data);
  } catch (e) {
    console.log(e)
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let updateMateriaPrima = async (req, res, next) => {
  const { token } = req.headers;
  const { idMateriaPrima, precio } = req.body;
  try {
    const user = await tokenServer.decode(token);
    const proveedor = await Proveedor.findOne({ usuario: user._id, status: true });
    if (!proveedor) {
      return res.status(404).send({
        message: 'No se encontró el almacén'
      })
    }
    for (let i = 0; i < proveedor.materiasPrimas.length; i++) {
      if (proveedor.materiasPrimas[i].materiaPrima.toString() === idMateriaPrima && proveedor.materiasPrimas[i].status) {
        proveedor.materiasPrimas[i].precio = precio;
        const data = await Proveedor.findByIdAndUpdate({ _id: proveedor._id }, { materiasPrimas: proveedor.materiasPrimas });
        return res.status(200).json(data);
      }
      else if (proveedor.materiasPrimas[i].materiaPrima.toString() !== idMateriaPrima && proveedor.materiasPrimas[i].status && (i === proveedor.materiasPrimas.length - 1)) {
        return res.status(404).send({
          message: 'No se encontró la materia prima'
        })
      }
    }
  } catch (e) {
    console.log(e)
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let removeMateriaPrima = async (req, res, next) => {
  const { token } = req.headers;
  const { idMateriaPrima}= req.body;
  try {
    const user = await tokenServer.decode(token);
    const proveedor = await Proveedor.findOne({ usuario: user._id, status: true });
    for (let i = 0; i < proveedor.materiasPrimas.length; i++) {
      if (proveedor.materiasPrimas[i].materiaPrima.toString() === idMateriaPrima && proveedor.materiasPrimas[i].status) {
        proveedor.materiasPrimas[i].status = false;
        const data = await Proveedor.findByIdAndUpdate({ _id: proveedor._id }, { materiasPrimas: proveedor.materiasPrimas });
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

let getMateriasPrimasPaginate = async (req, res, next) => {
  const { limit, page } = req.query;
  const { token } = req.headers;
  try {
    const user = await tokenServer.decode(token);
    const proveedor = await Proveedor.findOne({ usuario: user._id, status: true }).populate('usuario');
    let total = 0;
    for (let i = 0; i < proveedor.materiasPrimas.length; i++) {
      if (proveedor.materiasPrimas[i].status) {
        total++;
      }
    }
    const data = await Proveedor.aggregate([
      {
        '$match': {
          '_id': proveedor._id,
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
          'materiaPrima': {'$first':'$materiaPrima._id'},
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
          'materiaPrima': '$materiaPrima',
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

let getOrdenesPaginate = async (req, res, next) => {
  const { limit, page } = req.query;
  const { token } = req.headers;
  try {
      const user = await tokenServer.decode(token);
      const proveedor = await Proveedor.findOne({ usuario: user._id, status: true }).populate('usuario');
      const total = await Orden.find({ proveedor: proveedor._id, status: true });
      const data = await Orden.aggregate([
          {
              '$match': {
                  'proveedor': proveedor._id,
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
  getMateriaPrimaById,
  getAll,
  getAllPaginate,
  getMateriasPrimasById,
  getMateriasPrimasByIdPaginate,
  getMateriasPrimasPaginate,
  getOrdenesPaginate,
  getById,
  update,
  updateMateriaPrima,
  remove,
  removeMateriaPrima
}