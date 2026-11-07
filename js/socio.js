// Modelo de datos para representar a cada socio.
class Socio {
    constructor({ nombre, edad, categoria, cuotaBase, id, cuotaActual, recargoAplicado }) {
        this.id = id || `socio_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        this.nombre = nombre;
        this.edad = Number(edad);
        this.categoria = categoria;
        this.cuotaBase = Number(cuotaBase);
        this.cuotaActual = Number(cuotaActual ?? cuotaBase);
        this.recargoAplicado = recargoAplicado ?? false;
    }

    aplicarRecargo() {
        if (this.recargoAplicado) return false;
        this.cuotaActual = Math.round(this.cuotaBase * 1.10 * 100) / 100;
        this.recargoAplicado = true;
        return true;
    }
}

// Se expone el modelo para que main.js pueda utilizarlo.
window.Socio = Socio;
