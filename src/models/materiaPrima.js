import { Schema, model } from 'mongoose';

const MateriaPrimaSchema = new Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    foto: { type: String, required: true },
    categoriaMateriaPrima: { type: Schema.Types.ObjectId, ref: "categoriaMateriaPrima" },
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
})

const MateriaPrima = model('materiaPrima', MateriaPrimaSchema, 'materiaPrima');
export default MateriaPrima;