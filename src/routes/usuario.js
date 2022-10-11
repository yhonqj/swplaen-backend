import routerx from 'express-promise-router';
import UsuarioController from '../controllers/usuario';

const app = routerx();
app.post('/addColaborador', UsuarioController.addColaborador);
app.get('/getAll', UsuarioController.getAll);
app.get('/getById', UsuarioController.getById);
app.put('/update', UsuarioController.update);
app.delete('/remove', UsuarioController.remove);
app.post('/loginColaborador', UsuarioController.loginColaborador);
export default app;