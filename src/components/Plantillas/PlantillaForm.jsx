const PlantillaForm = ({ formData, handleInputChange, areas }) => {
  return (
    <>
      {/* Nombre y Área */}
      <div className="form-row">
        <div className="form-group form-group-half">
          <label htmlFor="nombre">Nombre de la Plantilla *</label>
          <input type="text" id="nombre" name="nombre" value={formData.nombre || ""} onChange={handleInputChange} placeholder="Ej: Recordatorio de Cita Personalizado" required />
        </div>
        {/* Área */}
        <div className="form-group form-group-half">
          <label htmlFor="area_id">Área *</label>
          <select
            id="area_id" name="area_id" value={formData.area_id || ""} onChange={handleInputChange} required>
            <option value="">Seleccione un área</option>

            {Array.isArray(areas) && areas.map(a => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Descripción */}
      <div className="form-group">
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" value={formData.descripcion || ""} onChange={handleInputChange} placeholder="Describe para qué se usa esta plantilla..." rows="2" />
      </div>
    </>
  );
};

export default PlantillaForm;