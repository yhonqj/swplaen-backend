import Almacen from '../models/almacen'
import mail from '../services/mail';
import { Types } from 'mongoose';
import constants from '../utils/constants';


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
  const { id, idProducto } = req.query;
  try {
    const data = await Almacen.findOne({ _id: id, 'productos.producto': idProducto, 'productos.status': true }).populate('productos.producto');
    res.status(200).json({ nombre: data.productos[0].producto.nombre, stock: data.productos[0].stock, stockMinimo: data.productos[0].stockMinimo });
  } catch (e) {
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let addProducto = async (req, res, next) => {
  const { idAlmacen, stock, idProducto, fecha } = req.body;
  try {
    const almacen = await Almacen.findOne({ _id: idAlmacen, status: true });
    if (!almacen) {
      return res.status(404).send({
        message: 'No se encontró el almacén'
      })
    }
    let movimientos = { cantidad: stock, fecha, tipoMovimiento: constants.tipoMovimiento.entrada };
    if (almacen.productos.length !== 0) {
      for (let i = 0; i < almacen.productos.length; i++) {
        if (almacen.productos[i].producto.toString() === idProducto && almacen.productos[i].status) {
          almacen.productos[i].stock += stock;
          movimientos.detalle = constants.detalleMovimiento.updateAlmacen;
          almacen.productos[i].movimientos.push(movimientos);
          const data = await Almacen.findByIdAndUpdate({ _id: idAlmacen }, { productos: almacen.productos });
          return res.status(200).json(data);
        }
        else if (almacen.productos[i].producto.toString() !== idProducto && almacen.productos[i].status && (i === almacen.productos.length - 1)) {
          movimientos.detalle = constants.detalleMovimiento.addAlmacen;
          almacen.productos.push({ stock, producto: idProducto, movimientos: [movimientos] })
          const data = await Almacen.findByIdAndUpdate({ _id: idAlmacen }, { productos: almacen.productos });
          return res.status(200).json(data);
        }
      }
    }
    else {
      movimientos.detalle = constants.detalleMovimiento.addAlmacen;
      almacen.productos.push({ stock, producto: idProducto, movimientos: [movimientos] })
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
    if (!almacen) {
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

let getProductosById = async (req, res, next) => {
  let id = req.query.id;
  try {
    const data = await Almacen.aggregate([
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
          'stockMinimo': '$productos.stockMinimo',
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
          'stockMinimo': '$stockMinimo',
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

    return res.status(200).json(data);
  } catch (e) {
    console.log(e)
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let getProductosByIdPaginate = async (req, res, next) => {
  let { id, limit, page } = req.query;
  try {
    const almacen = await Almacen.findOne({ _id: id, status: true });
    let total = 0;
    for (let i = 0; i < almacen.productos.length; i++) {
      if (almacen.productos[i].status) {
        total++;
      }
    }
    const data = await Almacen.aggregate([
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
          'stockMinimo': '$productos.stockMinimo',
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
          'stockMinimo': '$stockMinimo',
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

    return res.status(200).json({ results: data, total, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    console.log(e)
    res.status(500).send({
      message: "Error en el proceso"
    })
  }
}

let getMovimientosProductoByIdPaginate = async (req, res, next) => {
  let { id, idProducto, limit, page } = req.query;
  try {
    const total = await Almacen.aggregate([
      {
        '$match': {
          '_id': new Types.ObjectId(id),
          'status': true
        }
      }, {
        '$unwind': '$productos'
      }, {
        '$match': {
          'productos.producto': new Types.ObjectId(idProducto)
        }
      }, {
        '$unwind': '$productos.movimientos'
      }, {
        '$project': {
          'producto': '$productos.producto',
          'cantidad': '$productos.movimientos.cantidad',
          'detalle': '$productos.movimientos.detalle',
          'fecha': '$productos.movimientos.fecha',
          'tipoMovimiento': '$productos.movimientos.tipoMovimiento'
        }
      }
    ]);
    const data = await Almacen.aggregate([
      {
        '$match': {
          '_id': new Types.ObjectId(id),
          'status': true
        }
      }, {
        '$unwind': '$productos'
      }, {
        '$match': {
          'productos.producto': new Types.ObjectId(idProducto)
        }
      }, {
        '$unwind': '$productos.movimientos'
      }, {
        '$project': {
          'producto': '$productos.producto',
          'cantidad': '$productos.movimientos.cantidad',
          'detalle': '$productos.movimientos.detalle',
          'fecha': '$productos.movimientos.fecha',
          'tipoMovimiento': '$productos.movimientos.tipoMovimiento'
        }
      }, {
        '$limit': Number(limit)
      }, {
        '$skip': ((page - 1) * limit)
      }
    ]);

    return res.status(200).json({ results: data, total: total.length, totalPages: Math.ceil(total.length / limit) });
  } catch (e) {
    console.log(e)
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
  getProductosById,
  getProductosByIdPaginate,
  getMovimientosProductoByIdPaginate,
  update,
  remove,
  addProducto,
  updateProducto,
  removeProducto
}