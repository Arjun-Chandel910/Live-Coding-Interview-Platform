import { toast } from "react-toastify";

const TOAST_CONFIG = {
  position: "top-center",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};
export const showSuccess = (message) => toast.success(message, TOAST_CONFIG);
export const showError = (message) => toast.error(message, TOAST_CONFIG);
export const showInfo = (message) => toast.info(message, TOAST_CONFIG);
export const showWarning = (message) => toast.warning(message, TOAST_CONFIG);
