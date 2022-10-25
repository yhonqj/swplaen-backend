import { Schema, model } from 'mongoose';

const ColaboradorSchema = new Schema({
    dni: { type: String, required: true },
    usuario: { type: Schema.Types.ObjectId, required: true, ref: "usuario" },
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
})

const Colaborador = model('colaborador', ColaboradorSchema, 'colaborador');
export default Colaborador;