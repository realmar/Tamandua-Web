import { Injectable } from '@angular/core';
import { ApiService } from './api-service';

@Injectable()
export class TamanduaMockService implements ApiService {
  getFields (): Array<string> {
    return [
      'sender',
      'recipient'
    ];
  }
}
