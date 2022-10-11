import tokenServer from '../services/token'

let verifyColaborador = async (req, res, next) => {
    if (!req.headers.token) {
        return res.status(404).send({
            message: "Error. No se tiene un token"
        });
    }
    const resp = await tokenServer.decode(req.headers.token)
    console.log(resp)
    if (resp){
        const tipoUsuario = await TipoUsuario.findOne(resp._id)
        if (tipoUsuario.nombre == 'Colaborador'){
            next();
        } else {
            
            return res.status(403).send({
                message: 'Sin autorización'
            })
        }
    } else {
        return res.status(403).send({
            message: 'Sin autorización'
        })
    }
}

export default {
    verifyColaborador
}