import CategoriaMateriaPrima from '../models/categoriaMateriaPrima'

let getAll = async (req, res, next) => {
    try {
        const data = await CategoriaMateriaPrima.find({ status: true });
        return res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

export default {
    getAll
}