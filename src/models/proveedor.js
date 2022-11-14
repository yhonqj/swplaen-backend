import { Schema, model } from 'mongoose';

const MateriasPrimasSubSchema = new Schema({ 
    cantidad: {type: Number, required: true }, 
    precio: {type: Number, required: true, default: 1 },
    materiaPrima: {type: Schema.Types.ObjectId, required: true, ref: 'materiaPrima'},
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
},{_id: false});

const ProveedorSchema = new Schema({
    ruc: { type: String, required: true },
    razonSocial: { type: String, required: true },
    direccion: { type: String, required: true },
    referencia: { type: String, required: true },
    codigoPostal: { type: String, required: true },
    materiasPrimas: [MateriasPrimasSubSchema],
    usuario: { type: Schema.Types.ObjectId, required: true, ref: "usuario" },
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
})

const Proveedor = model('proveedor', ProveedorSchema, 'proveedor');
export default Proveedor;