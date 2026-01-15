const PlantillaForm = ({ formData, handleInputChange }) => {
  return (
    <>
      {/* Nombre, categoría, correo */}
      <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="nombre">Nombre de la Plantilla *</label>
                  <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: Recordatorio de Cita Personalizado" required />
                </div>

                <div className="form-group form-group-half">
                  <label htmlFor="categoria">Categoría</label>
                  <select id="categoria" name="categoria" value={formData.categoria} onChange={handleInputChange} >
                    <option value="personalizada">Personalizada</option>
                    <option value="citas">Citas</option>
                    <option value="calidad">Calidad</option>
                    <option value="talento">Talento Humano</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="form-group form-group-half">
                  <label htmlFor="correoRemitente">Correo Remitente (Desde) *</label>
                  <select id="correoRemitente" name="correoRemitente" value={formData.correoRemitente} onChange={handleInputChange}>
                    <option value="micita@umit.com.co">micita@umit.com.co (Citas)</option>
                    <option value="calidad@umit.com.co">calidad@umit.com.co (Calidad)</option>
                    <option value="talento@umit.com.co">talento@umit.com.co (Talento Humano)</option>
                    <option value="consulta@umit.com.co">consulta@umit.com.co (Consulta)</option>
                  </select>
                  <small>Este será el correo desde el cual se enviarán los mensajes</small>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Describe para qué se usa esta plantilla..." rows="2" />
              </div>
    </>
  );
};

export default PlantillaForm;