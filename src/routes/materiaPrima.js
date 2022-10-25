import routerx from 'express-promise-router';
import MateriaPrimaController from '../controllers/materiaPrima';
import { check } from 'express-validator'
import valid from '../middlewares/validation'

const app = routerx();
app.get('/getAll', MateriaPrimaController.getAll);
app.get('/getAllPaginate',[
    check('limit', 'El límite es obligatorio').not().isEmpty(),
    check('page', 'La página es obligatoria').not().isEmpty(),
    valid.validCampos
], MateriaPrimaController.getAllPaginate);
app.get('/getById', MateriaPrimaController.getById);
app.post('/add',[
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
    check('foto','La foto es obligatoria').not().isEmpty(),
    valid.validCampos
], MateriaPrimaController.add);
app.put('/update', MateriaPrimaController.update);
app.delete('/remove', MateriaPrimaController.remove);

export default app;