import { ToastrService } from 'ngx-toastr';
import { ErrorConstants } from './error-constants';

export class ToastrUtils {
  public static removeAllWithMessage (toastr: ToastrService, message: string) {
    toastr.toasts.forEach(toast => {
      toastr.remove(toast.toastId);
    });
  }

  public static removeAllGenericServerErrors (toastr: ToastrService): void {
    ToastrUtils.removeAllWithMessage(toastr, ErrorConstants.GenericServerError);
  }

  public static showGenericServerError (toastr: ToastrService): void {
    toastr.error(ErrorConstants.GenericServerError, ErrorConstants.GenericErrorTitle, {
      disableTimeOut: true
    });
  }
}
