describe("get availability", () => {
  const apiUrl = Cypress.env('API_URL');
  console.log(apiUrl); 

  it("Should display available timeslots for a product @integration", () => {

    cy.request(`${apiUrl}/api/products`).then((response) => {
      const products = response.body;
      cy.request(`${apiUrl}/api/availability/${products[0].id}`).then((availabilityResponse) => {
        const expectedTimeslots = availabilityResponse.body.dates.map((slot: { date: string; price: number; }) => ({
          time: slot.date.substring(11, 16),
          price: `£${slot.price.toFixed(2)}`
        }));

        cy.launchApp("/?attraction_id=123");
   
        cy.contains("span", products[0].name) // Find the span with the specific text
          .closest("li") 
          .find("button")
          .click();
    
        cy.get('div[cy-tag="time-slots"]').each(($el, index) => {
          console.log("Index : " + index);
          const expectedTime = expectedTimeslots[index].time;
          const expectedPrice = expectedTimeslots[index].price;
    
          // Verify the time
          cy.wrap($el).find('div[cy-tag="time-slot-time"]').should("have.text", expectedTime);
          // Verify the price
          cy.wrap($el).find('div[cy-tag="time-slot-price"]').should("have.text", expectedPrice);
        });
      });
    });
  });

  it("Should display message when there are no timeslots @notimeslots", () => {
    cy.launchApp("/?attraction_id=123");
    cy.contains("span", "No timeslots found") // Find the span with the specific text
      .closest("li") // Find the closest ancestor li element
      .find("button") // Find the button within this li
      .click();
    cy.get(".fade").should("contain", "No timeslots found. Please try again.");
  });

  it("Should display message when there is an error getting timeslots @notimeslots", () => {
    cy.launchApp("/?attraction_id=123");
    cy.contains("span", "Error for timeslots") // Find the span with the specific text
      .closest("li") // Find the closest ancestor li element
      .find("button") // Find the button within this li
      .click();
    cy.get(".fade").should("contain", "There was an error getting timeslots information. Please try again.");
  });
});