import { Schema, model } from 'mongoose';

const MateriasPrimasSubSchema = new Schema({ 
    cantidad: {type: Number, required: true }, 
    precio: {type: Number, required: true, default: 1 },
    almacen: {type: Schema.Types.ObjectId, required: false, ref: 'almacenMp'},
    materiaPrima: {type: Schema.Types.ObjectId, required: true, ref: 'materiaPrima'}
},{_id: false});

const OrdenSchema = new Schema({
    proveedor: { type: Schema.Types.ObjectId, required: true, ref: 'proveedor' },
    fechaEmision: { type: Date, default: Date.now, required: true },
    fechaEntrega: { type: Date, required: false },
    observacion: { type: String, required: false },
    estadoOrden: { type: Number, required: true },
    materiasPrimas: [MateriasPrimasSubSchema],
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
})

const Orden = model('orden', OrdenSchema, 'orden');
export default Orden;