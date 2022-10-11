import { Schema, model } from 'mongoose';

const MovimientoAlmacenSchema = new Schema({
    cantidad: { type: Number, required: true, validate: { validator : Number.isInteger, message   : '{VALUE} no es un valor entero'} },
    detalle: { type: String, required: false },
    fecha: { type: Date, required: true },
    productoAlmacen: { type: Schema.Types.ObjectId, required: true, ref: "productoAlmacen" },
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
})

const MovimientoAlmacen = model('movimientoAlmacen', MovimientoAlmacenSchema, 'movimientoAlmacen');
export default MovimientoAlmacen;