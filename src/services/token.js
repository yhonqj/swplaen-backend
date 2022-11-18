import jwt from 'jsonwebtoken';
import Usuario from '../models/usuario';
import * as dotenv from 'dotenv';
dotenv.config();

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
        const token = await jwt.sign({_id: data}, process.env.TOKEN_KEY, {expiresIn: '1d'} )
        return {token, tipoUsuario: user.tipoUsuario}
    } else {
        return false;
    }
}

let encode = async (user) => {
    const {_id, tipoUsuario} = user
    const token = await jwt.sign({_id, tipoUsuario}, process.env.TOKEN_KEY, {expiresIn: '1d'} )
    return token;
}

let decode = async (token) => {
    try {
        const { _id } = await jwt.verify(token, process.env.TOKEN_KEY);
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