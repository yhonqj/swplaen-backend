import { Schema, model } from 'mongoose';

const CategoriaMateriaPrimaSchema = new Schema({
    nombre: { type: String, required: true },
    creadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaCreacion: { type: Date, default: Date.now },
    modificadoPor: { type: Schema.Types.ObjectId, ref: "usuario" },
    fechaModificacion: { type: Date, default: Date.now },
    status: { type: Boolean, default: true, required: true }
})

const CategoriaMateriaPrima = model('categoriaMateriaPrima', CategoriaMateriaPrimaSchema, 'categoriaMateriaPrima');
export default CategoriaMateriaPrima;