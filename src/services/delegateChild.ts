// Estado do "modo cuidador" (SP-21) isolado num módulo próprio, minúsculo e
// sem dependências. A DelegationContext (montada globalmente e sem
// code-splitting) só precisa deste arquivo, não do api.ts inteiro — evita
// puxar todas as dezenas de definições de API para o bundle de entrada.
let delegateChildId: string | null = null;

export function setDelegateChildId(childId: string | null): void {
  delegateChildId = childId;
}

export function getDelegateChildId(): string | null {
  return delegateChildId;
}
