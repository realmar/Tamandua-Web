import { Unsubscribable } from 'rxjs/internal/types';
import { isNullOrUndefined } from './misc';

export function unsubscribeIfDefined (...subscriptions: Unsubscribable[]): void {
  subscriptions.forEach(subscription => {
    if (!isNullOrUndefined(subscription)) {
      subscription.unsubscribe();
    }
  });
}
