
describe("Attraction ID request parameter", () => {
  const apiUrl = Cypress.env('API_URL');
  console.log(apiUrl); 

  it("Should show an error when the Attraction ID request parameter is not provided", () => {
    cy.launchApp("/");
    cy.get(".fade").should("contain", "Attraction ID not set. Please try again.");
  });

});
