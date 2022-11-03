import routerx from 'express-promise-router';
import CategoriaMateriaPrimaController from '../controllers/categoriaMateriaPrima';

const app = routerx();
app.get('/getAll', CategoriaMateriaPrimaController.getAll);

export default app;