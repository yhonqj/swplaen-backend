import { Schema, model } from 'mongoose';

const movimientosSubSchema = new Schema({
    cantidad: { type: Number, required: true }, 
    detalle: { type: String, required: false, maxlength: 400 },
    fecha: { type: Date, required: true },
    tipoMovimiento: { type: Number, required: true }
},{_id: false});

const productosSubSchema = new Schema({ 
    stock: {type: Number, required: true }, 
    stockMinimo: {type: Number, required: true, default: 1 }, 
    producto: {type: Schema.Types.ObjectId, required: true, ref: 'producto'},
    movimientos: [movimientosSubSchema],
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
},{_id: false});

const AlmacenSchema = new Schema({
    codigo: { type: String, maxlength: 15, required: true },
    descripcion: { type: String, maxlength: 300, required: false },
    ubicacion: { type: String, maxlength: 300, required: true },
    capacidad: { type: Number, required: true },
    productos: [productosSubSchema],
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
});

const Almacen = model('almacen', AlmacenSchema, 'almacen');
export default Almacen;