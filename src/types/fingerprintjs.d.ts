declare module "@fingerprintjs/fingerprintjs" {
  /**
   * The result returned by FingerprintJS `agent.get()`.
   */
  export interface GetResult {
    visitorId: string;
    // Other fields are not used in this project for now
    [key: string]: unknown;
  }

  /**
   * FingerprintJS agent instance.
   */
  export interface Agent {
    get(): Promise<GetResult>;
  }

  /**
   * The default export exposed by `@fingerprintjs/fingerprintjs`.
   */
  const FingerprintJS: {
    load(): Promise<Agent>;
  };

  export default FingerprintJS;
}
