import { PersistentCachedTamanduaService } from './persistent-cached-tamandua.service';
import { HttpClient } from '@angular/common/http';
import { PersistentStorageService } from '../persistence/persistent-storage-service';
import { ToastrService } from 'ngx-toastr';
import { ApiErrorHandlerDecoratorService } from './api-error-handler-decorator.service';

export function apiFactory (toastr: ToastrService, storage: PersistentStorageService, httpClient: HttpClient) {
  return new ApiErrorHandlerDecoratorService(
    toastr,
    new PersistentCachedTamanduaService(storage, httpClient));
}
