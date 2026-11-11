/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "false" calls the real API; anything else serves sample fixtures. */
  readonly VITE_USE_FIXTURES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
