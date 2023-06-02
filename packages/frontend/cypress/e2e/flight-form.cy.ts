// https://docs.cypress.io/api/introduction/api.html

describe("Test the flight form", () => {
  beforeEach(() => {
    // spying and response stubbing
    cy.intercept("/api/airports/options", { fixture: "airport.json" }).as("getAirports");
    cy.intercept("/api/projections/options", { fixture: "projection.json" }).as("getProjections");
    cy.visit("/");
    cy.wait(["@getAirports", "@getProjections"]);
  });

  it("checks if title is set correctly", () => {
    cy.contains("h3", "Konfiguration der Bildgenerierung:");
  });

  it("should enter all required parameters for ICAO-generation to generate an image with LINEAR projection", () => {
    cy.get("[data-cy=flightpath-image]").should("not.exist");
    // Linear <- true, background <- true, foregroundcolor <- true; mapbox-or-bcolor should not exist
    cy.get("[data-cy=strategy-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("ICAO").click();
    cy.get("[data-cy=airport-dropdown]").parent().click().type("00AA");
    cy.get(".options-container.v-select").contains("Aero B Ranch Airport - 00AA").click();
    cy.get("[data-cy=radius-input]").parent().click();
    cy.get("[data-cy=radius-input]").clear().type("5");
    cy.get("[data-cy=projection-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("LINEAR").click();
    cy.get("[data-cy=foreground-picker").clear().type("#55555F");
    cy.get("[data-cy=background-picker]").clear().type("#FFFF00");
    cy.get("[data-cy=resolution-input]").clear().type("500");

    cy.get("[data-cy=mapbox-or-color]").should("not.exist");
    cy.get("[data-cy=generateimage-button]").should("to.be.enabled");
  });

  it("should enter all required parameters for RADIUS-generation to generate an image with LINEAR projection", () => {
    cy.get("[data-cy=flightpath-image]").should("not.exist");
    cy.get("[data-cy=strategy-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("RADIUS").click();
    cy.get("[data-cy=radius-input]").clear().type("5");
    cy.get("[data-cy=projection-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("LINEAR").click();
    cy.get("[data-cy=foreground-picker").clear().type("#554455");
    cy.get("[data-cy=background-picker]").clear().type("#323525");
    cy.get("[data-cy=resolution-input]").clear().type("500");

    cy.get("[data-cy=mapbox-or-color]").should("not.exist");
    cy.get("[data-cy=generateimage-button]").should("not.be.disabled");
  });

  it("should enter all required parameters for RECTANGLE-generation to generate an image", () => {
    cy.get("[data-cy=flightpath-image]").should("not.exist");
    cy.get("[data-cy=strategy-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("RECTANGLE").click();
    cy.get("[data-cy=textfield-lon]").eq(1).clear().type("2");
    cy.get("[data-cy=textfield-lat]").eq(1).clear().type("3");
    cy.get("[data-cy=projection-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("LINEAR").click();
    cy.get("[data-cy=foreground-picker").clear().type("#554455");
    cy.get("[data-cy=background-picker]").clear().type("#323525");
    cy.get("[data-cy=resolution-input]").clear().type("500");

    cy.get("[data-cy=mapbox-or-color]").should("not.exist");
    cy.get("[data-cy=generateimage-button]").should("not.be.disabled");
  });

  it("should enter not valid radius for ICAO-generation that image generation button should be disabled", () => {
    cy.get("[data-cy=flightpath-image]").should("not.exist");

    cy.get("[data-cy=strategy-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("ICAO").click();
    cy.get("[data-cy=airport-dropdown]").parent().click().type("00AA");
    cy.get(".options-container.v-select").contains("Aero B Ranch Airport - 00AA").click();
    cy.get("[data-cy=radius-input]").parent().click();
    cy.get("[data-cy=radius-input]").clear().type("-5");
    cy.get("[data-cy=projection-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("LINEAR").click();
    cy.get("[data-cy=foreground-picker").clear().type("#55555F");
    cy.get("[data-cy=background-picker]").clear().type("#FFFF00");
    cy.get("[data-cy=resolution-input]").clear().type("500");

    cy.get("[data-cy=mapbox-or-color]").should("not.exist");
    cy.get("[data-cy=generateimage-button]").should("be.disabled");
  });

  it("should enter not valid radius value for RADIUS-generation that image generation button should be disabled", () => {
    cy.get("[data-cy=flightpath-image]").should("not.exist");
    cy.get("[data-cy=strategy-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("RADIUS").click();
    cy.get("[data-cy=radius-input]").clear().type("0");

    cy.get("[data-cy=projection-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("LINEAR").click();
    cy.get("[data-cy=foreground-picker").clear().type("#55555F");
    cy.get("[data-cy=background-picker]").clear().type("#FFFF00");
    cy.get("[data-cy=resolution-input]").clear().type("500");

    cy.get("[data-cy=mapbox-or-color]").should("not.exist");
    cy.get("[data-cy=generateimage-button]").should("be.disabled");
  });

  it("should enter not valid lat lon value for RECTANGLE-generation that image generation button should be disabled", () => {
    cy.get("[data-cy=flightpath-image]").should("not.exist");
    cy.get("[data-cy=strategy-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("RECTANGLE").click();
    cy.get("[data-cy=textfield-lon]").eq(1).clear().type("-181");
    cy.get("[data-cy=textfield-lat]").eq(1).clear().type("91");
    cy.get("[data-cy=projection-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("LINEAR").click();
    cy.get("[data-cy=foreground-picker").clear().type("#554455");
    cy.get("[data-cy=background-picker]").clear().type("#323525");
    cy.get("[data-cy=resolution-input]").clear().type("500");

    cy.get("[data-cy=mapbox-or-color]").should("not.exist");
    cy.get("[data-cy=generateimage-button]").should("be.disabled");
  });

  it("should enter not valid resolution and image generation button should be disabled", () => {
    cy.get("[data-cy=flightpath-image]").should("not.exist");
    cy.get("[data-cy=airport-dropdown]").parent().click().type("00AA");
    cy.get(".options-container.v-select").contains("Aero B Ranch Airport - 00AA").click();
    cy.get("[data-cy=radius-input]").parent().click();
    cy.get("[data-cy=radius-input]").clear().type("5");
    cy.get("[data-cy=projection-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("MERCATOR").click();
    cy.get("[data-cy=foreground-picker").clear().type("#554455");
    cy.get("[data-cy=background-picker]").clear().type("#323525");
    cy.get("[data-cy=resolution-input]").clear().type("-500");

    cy.get("[data-cy=mapbox-or-color]").should("not.exist");
    cy.get("[data-cy=generateimage-button]").should("be.disabled");
  });

  it("should generate an image with MERCATOR projection and background-/foregroundcolor", () => {
    cy.get("[data-cy=flightpath-image]").should("not.exist");
    // Mercator <- true, background <- true, foregroundcolor <- true
    cy.get("[data-cy=strategy-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("ICAO").click();
    cy.get("[data-cy=airport-dropdown]").parent().click().type("00AA");

    cy.get(".options-container.v-select").contains("Aero B Ranch Airport - 00AA").click();
    cy.get("[data-cy=radius-input]").parent().click();
    cy.get("[data-cy=radius-input]").clear().type("5");
    cy.get("[data-cy=projection-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("MERCATOR").click();

    cy.get("[data-cy=mapbox-or-bcolor]").parent(); // --> called but not enabled (color set | mapbox not set)

    cy.get("[data-cy=foreground-picker").clear().type("#55555F");
    cy.get("[data-cy=background-picker]").clear().type("#FFFF00");

    cy.get("[data-cy=resolution-input]").clear().type("500");

    cy.get("[data-cy=background-picker]").should("exist");
    cy.get("[data-cy=generateimage-button]").should("to.be.enabled");
  });

  it("should generate an image with MERCATOR projection and Mapbox as background", () => {
    cy.get("[data-cy=flightpath-image]").should("not.exist");
    // Mercator <- true, background <-false, foregroundcolor <- true
    cy.get("[data-cy=strategy-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("ICAO").click();
    cy.get("[data-cy=airport-dropdown]").parent().click().type("00AA");

    cy.get(".options-container.v-select").contains("Aero B Ranch Airport - 00AA").click();
    cy.get("[data-cy=radius-input]").parent().click();
    cy.get("[data-cy=radius-input]").clear().type("5");
    cy.get("[data-cy=projection-dropdown]").parent().click();
    cy.get("div.v-list-item-title").contains("MERCATOR").click();

    cy.get("[data-cy=mapbox-or-bcolor]").parent().click(); // --> enable MapBox

    cy.get("[data-cy=foreground-picker").clear().type("#55555F");
    cy.get("[data-cy=resolution-input]").clear().type("500");

    cy.get("[data-cy=background-picker]").should("not.exist"); // ->> background-picker should not exist
    cy.get("[data-cy=generateimage-button]").should("to.be.enabled");
  });
});
