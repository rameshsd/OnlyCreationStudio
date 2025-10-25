
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: The following request was denied by Firestore security rules.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is for environments that support it (e.g., V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }

  toString() {
    return `${this.message}\n\nContext:\n${JSON.stringify(
      this.context,
      null,
      2
    )}`;
  }
}
