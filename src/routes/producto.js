import routerx from 'express-promise-router';
import ProductoController from '../controllers/producto';
import { check } from 'express-validator'
import valid from '../middlewares/validation'

const app = routerx();
app.get('/getAll', ProductoController.getAll);
app.get('/getAllPaginate',[
    check('limit', 'El límite es obligatorio').not().isEmpty(),
    check('page', 'La página es obligatoria').not().isEmpty(),
    valid.validCampos
], ProductoController.getAllPaginate);
app.get('/getById', ProductoController.getById);
app.post('/add',[
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
    check('foto','La foto es obligatoria').not().isEmpty(),
    valid.validCampos
], ProductoController.add);
app.put('/update', ProductoController.update);
app.delete('/remove', ProductoController.remove);

export default app;