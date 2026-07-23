import { toast } from "react-hot-toast";

export const showToast = (message, type = "success") => {
  if (type === "error") {
    toast.error(String(message));
    return;
  }
  toast.success(String(message));
};