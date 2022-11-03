import tokenServer from '../services/token'
import enums from '../utils/enums'
import Usuario from '../models/usuario'

let verifyAdmin = async (req, res, next) => {
    if (!req.headers.token) {
        return res.status(404).send({
            message: "Error. No se tiene un token"
        });
    }
    const resp = await tokenServer.decode(req.headers.token)
    console.log(resp)
    if (resp) {
        const usuario = await Usuario.findOne({ _id: resp._id });
        if (usuario) {
            const tipoUsuario = enums.tipoUsuario.find(x => x.id === usuario.tipoUsuario);
            if (tipoUsuario.nombre === 'Administrador' || tipoUsuario.nombre === 'Almacenero' || tipoUsuario.nombre === 'Proveedor') {
                next();
            } else {

                return res.status(403).send({
                    message: 'Sin autorización'
                })
            }
        }
        else {
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
    verifyAdmin
}