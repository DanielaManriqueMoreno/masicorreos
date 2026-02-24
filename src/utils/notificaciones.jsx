import { toast } from 'react-toastify';

export const notifySuccess = (mensaje) => {
  toast.success(mensaje);
};

export const notifyError = (mensaje) => {
  toast.error(mensaje);
};

export const notifyWarning = (mensaje) => {
  toast.warning(mensaje);
};