const tipoUsuario = [
    {
        id: 1,
        nombre: 'Administrador'
    },
    {
        id: 2,
        nombre: 'Almacenero'
    },
    {
        id: 3,
        nombre: 'Proveedor'
    },
    {
        id: 4,
        nombre: 'Cliente'
    }
]

const estadoCotizacion = [
    {
        id: 1,
        nombre: 'Pendiente'
    },
    {
        id: 2,
        nombre: 'Aprobada'
    },
    {
        id: 3,
        nombre: 'Rechazada'
    }
]

const estadoOrden = [
    {
        id: 1,
        nombre: 'Pendiente'
    },
    {
        id: 2,
        nombre: 'Completada'
    },
    {
        id: 3,
        nombre: 'Cancelada'
    }
]

const tipoMovimiento = [
    {
        id: 1,
        nombre: 'Entrada'
    },
    {
        id: 2,
        nombre: 'Salida'
    }
]

export default { 
    tipoUsuario,
    estadoCotizacion,
    estadoOrden,
    tipoMovimiento
}