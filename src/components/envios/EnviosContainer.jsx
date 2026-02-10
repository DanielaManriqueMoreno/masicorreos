import Envios from './Envios';
import { useEnvios } from './useEnvios';

const EnviosContainer = ({ plantillaSeleccionada, usuario }) => {
  const envios = useEnvios(plantillaSeleccionada, usuario);

  return (
    <Envios
      {...envios}
      plantillaSeleccionada={plantillaSeleccionada}
    />
  );
};

export default EnviosContainer;