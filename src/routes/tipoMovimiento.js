import routerx from 'express-promise-router';
import TipoMovimientoController from '../controllers/tipoMovimiento';

const app = routerx();
app.get('/getAll', TipoMovimientoController.getAll);

export default app;