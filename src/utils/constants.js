const tipoUsuario = {
    administrador: 'Administrador',
    almacenero: 'Almacenero',
    proveedor: 'Proveedor',
    cliente: 'Cliente'
}

const tipoMovimiento = {
    entrada: 1,
    salida: 2
}

const detalleMovimiento = {
    addAlmacen: 'Se registró el producto en el almacén',
    updateAlmacen: 'Se actualizaron los datos del producto en el almacén',
    addTienda: 'Se registró el producto en la tienda',
    updateTienda: 'Se actualizaron los datos del producto en la tienda'
}

export default {
    tipoUsuario,
    tipoMovimiento,
    detalleMovimiento
}