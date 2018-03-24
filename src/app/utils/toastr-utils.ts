import { ToastrService } from 'ngx-toastr';

export class ToastrUtils {
  public static removeAllWithMessage (toastr: ToastrService, message: string) {
    toastr.toasts.forEach(toast => {
      toastr.remove(toast.toastId);
    });
  }
}
