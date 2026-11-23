import type { ErrorEvent, Breadcrumb } from '@sentry/react';

// Rastreamento de erros desligado até VITE_SENTRY_DSN existir. O SDK só é
// baixado quando há DSN, então sem configuração nada sai do aparelho e o
// primeiro carregamento não paga pelo pacote.
const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

let sentry: Promise<typeof import('@sentry/react')> | null = null;

// Links compartilhados levam o token de acesso no caminho; quem tem o token
// lê o registro, então ele não pode ir para um serviço de terceiros.
const SHARED_TOKEN = /\/(anamnese|consolidated)\/shared\/[^/?#]+/g;

export function scrubUrl(url: string): string {
  return url.split(/[?#]/)[0].replace(SHARED_TOKEN, '/$1/shared/:token');
}

function scrubBreadcrumb(crumb: Breadcrumb): Breadcrumb | null {
  // Valores digitados em formulários são dados de saúde da criança.
  if (crumb.category === 'ui.input') return null;
  const data = crumb.data && { ...crumb.data };
  if (data) {
    for (const key of ['url', 'from', 'to']) {
      if (typeof data[key] === 'string') data[key] = scrubUrl(data[key]);
    }
    delete data.body;
    delete data.value;
  }
  return { ...crumb, data, message: crumb.message && scrubUrl(crumb.message) };
}

// LGPD: o evento não leva quem é o usuário, a requisição (URL com query,
// cabeçalhos, cookies), nem valores de formulário. Fica a pilha e o caminho.
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  delete event.user;
  delete event.request;
  delete event.extra;
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs
      .map(scrubBreadcrumb)
      .filter((c): c is Breadcrumb => c !== null);
  }
  return event;
}

export function initErrorTracking(): void {
  if (!dsn || sentry) return;
  sentry = import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      sendDefaultPii: false,
      // Sem session replay e sem tracing: só erros.
      integrations: (defaults) => defaults.filter((i) => i.name !== 'Replay'),
      beforeSend: scrubEvent,
      beforeBreadcrumb: scrubBreadcrumb,
    });
    return Sentry;
  });
}

export function reportError(error: unknown, componentStack?: string | null): void {
  sentry?.then((Sentry) => {
    Sentry.captureException(error, componentStack ? { contexts: { react: { componentStack } } } : undefined);
  });
}
