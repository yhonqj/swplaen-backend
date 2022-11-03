import Usuario from '../models/usuario'
import Colaborador from '../models/colaborador'
import Proveedor from '../models/proveedor'
import helpers from './helpers'
import enums from '../utils/enums'
import tokenServer from '../services/token'

let addColaborador = async (req, res, next) => {
    const { nombres, apellidos, correo, celular, dni, tipoUsuario } = req.body;
    const password = await helpers.encryptPassword("pinga");
    try {
        const tipo = enums.tipoUsuario.find(data => data.id === tipoUsuario)
        if (!tipo) {
            return res.status(404).send({
                message: "No se encontró el tipo de usuario"
            })
        }
        const data = await Usuario.create({
            nombres,
            apellidos,
            correo,
            celular,
            password,
            tipoUsuario
        })
        await Colaborador.create({
            dni,
            usuario: data._id
        })
        return res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getAll = async (req, res, next) => {
    try {
        const data = await Usuario.find({}, { password: 0 });
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getById = async (req, res, next) => {
    let id = req.query.id;
    try {
        let data = (await Usuario.findOne({ _id: id })).toObject();
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let getAdminProfile = async (req, res, next) => {
    const { token } = req.headers;
    try {
        const user = await tokenServer.decode(token);
        let usuario = await Usuario.findOne(user._id);
        const tipoUsuario = enums.tipoUsuario.find(x => x.id === usuario.tipoUsuario);
        let perfil = {};
        if (tipoUsuario.nombre === 'Administrador' || tipoUsuario.nombre === 'Almacenero'){
            perfil = await Colaborador.findOne({usuario: usuario._id})
        }
    
        else if (tipoUsuario.nombre === 'Proveedor'){
            perfil = await Proveedor.findOne({usuario: usuario._id})
        }
        else {
            return res.status(401).send({
                message: "Sin Autorización"
            })
        }
        return res.status(200).json({usuario, perfil});
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let update = async (req, res, next) => {
    const id = req.body._id;
    const { nombres, apellidos, correo, celular } = req.body;
    try {
        const data = await Usuario.findByIdAndUpdate({ _id: id }, {
            nombres,
            apellidos,
            correo,
            celular
        })
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let remove = async (req, res, next) => {
    const id = req.body._id;
    try {
        const data = await Usuario.findByIdAndUpdate({ _id: id }, {
            status: false
        })
        res.status(200).json(data);
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

let loginColaborador = async (req, res, next) => {
    const { correo, password } = req.body;
    try {
        let user = await Usuario.findOne({ correo, status: true });
        if (user) {
            let colaborador = await Colaborador.findOne({ usuario: user._id, status: true });
            if (colaborador) {
                let match = await helpers.matchPassword(password, user.password);
                if (match) {
                    let tokenReturn = await tokenServer.encode(user._id.toString());
                    res.status(200).json({ token: tokenReturn })
                } else {
                    res.status(404).send({
                        message: 'El usuario y la contraseña no coinciden'
                    })
                }
            } else {
                res.status(404).send({
                    message: 'El usuario no existe'
                })
            }
        } else {
            res.status(404).send({
                message: 'El usuario no existe'
            })
        }
    } catch (e) {
        res.status(500).send({
            message: "Error en el proceso"
        })
    }
}

export default {
    addColaborador,
    getAll,
    getById,
    update,
    remove,
    loginColaborador,
    getAdminProfile
}