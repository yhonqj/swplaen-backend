import jwt from 'jsonwebtoken';
import Usuario from '../models/usuario';

let data = null;
let checkToken = async (token) => {
    try{
        const { _id } = await jwt.decode(token);
        data = _id;
    } catch (e) {
        return false;
    }

    const user = await Usuario.findOne({_id: data, status: true});
    if (user) {
        const token = await jwt.sign({_id: data}, 'asasdasdasdasdasd', {expiresIn: '1d'} )
        return {token, idTipoUsuario: user.idTipoUsuario}
    } else {
        return false;
    }
}

let encode = async (_id) => {
    const token = await jwt.sign({_id}, 'asasdasdasdasdasd', {expiresIn: '1d'} )
    return token;
}

let decode = async (token) => {
    try {
        const { _id } = await jwt.verify(token, 'asasdasdasdasdasd');
        const user = await Usuario.findOne({_id, status: true});
        if (user){
            return user;
        }
        else{
            return false;
        }
    }
    catch (e) {
        const newToken = await checkToken(token);
        return newToken;
    }    
}

export default {
    encode,
    decode,
}