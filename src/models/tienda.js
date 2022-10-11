import { Schema, model } from 'mongoose';

const productosSubSchema = new Schema({ 
    stock: { type: Number, required: true },
    precio: { type: Number, required: true },
    descuento: { type: Number, required: true, default: 0},
    disponible: { type: Boolean, required: true, default: true },
    producto: { type: Schema.Types.ObjectId, required: true, ref: 'producto' },
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
},{_id: false});

const TiendaSchema = new Schema({
    direccion: { type: String, maxlength: 300, required: true },
    referencia: { type: String, maxlength: 300, required: true },
    productos: [productosSubSchema],
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
});

const Tienda = model('tienda', TiendaSchema, 'tienda');
export default Tienda;