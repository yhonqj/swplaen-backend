import { Schema, model } from 'mongoose';

const UsuarioSchema = new Schema({
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    correo: { type: String, required: true },
    celular: { type: String, required: true },
    password: { type: String, required: true },
    dni: { type: String, required: true },
    tipoUsuario: { type: Number, required: true },
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
})

const Usuario = model('usuario', UsuarioSchema, 'usuario');
export default Usuario;