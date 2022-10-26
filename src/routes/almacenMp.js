import routerx from 'express-promise-router';
import AlmacenMpController from '../controllers/almacenMp';
import { check } from 'express-validator'
import valid from '../middlewares/validation'

const app = routerx();
app.get('/getAll', AlmacenMpController.getAll);
app.get('/getAllPaginate', [
    check('limit', 'El límite es obligatorio').not().isEmpty(),
    check('page', 'La página es obligatoria').not().isEmpty(),
    valid.validCampos
],AlmacenMpController.getAllPaginate);
app.get('/getById', AlmacenMpController.getById);
app.post('/add', AlmacenMpController.add);
app.put('/update', AlmacenMpController.update);
app.delete('/remove', AlmacenMpController.remove);
app.patch('/addMateriaPrima', AlmacenMpController.addMateriaPrima);

export default app;