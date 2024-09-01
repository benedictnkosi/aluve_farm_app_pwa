declare namespace Cypress {
  interface Chainable {
    launchApp(path:string): Chainable<void>;
  }
}
