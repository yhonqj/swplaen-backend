import routerx from 'express-promise-router';
import UsuarioController from '../controllers/usuario';
import auth from '../middlewares/auth';

const app = routerx();
app.post('/addAdmin', UsuarioController.addAdmin);
app.get('/getAll', UsuarioController.getAll);
app.get('/getById', UsuarioController.getById);
app.get('/getAdminProfile', auth.verifyAdmin ,UsuarioController.getAdminProfile);
app.put('/update', UsuarioController.update);
app.delete('/remove', UsuarioController.remove);
app.post('/loginAdmin', UsuarioController.loginAdmin);
export default app;