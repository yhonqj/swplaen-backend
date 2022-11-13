import enums from "../utils/enums";

let getAll = (req, res, next) => {
    try {
        const data = enums.tipoMovimiento;
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
} 

export default {
    getAll
}