import { faker } from "@faker-js/faker";

const username = faker.internet.userName();
const password = faker.internet.password();

describe("Demoblaze ", () => {
  before(() => {
    cy.visit("https://www.demoblaze.com/");
  });
  it("create a user", () => {
    cy.percySnapshot("Page d'accueil ");
    cy.get("#signin2").click();
    cy.wait(1000);
    cy.get("#signInModal").should("be.visible");
    cy.percySnapshot("Modal d'inscription");
    cy.get("#sign-username")
      .should("be.visible")
      .type(username)
      .should("have.value", username);
    cy.get("#sign-password").type(password);
    cy.get("#signInModal").find(".btn-primary").click();
  });

  it("login with created user", () => {
    cy.get("#login2").click();
    cy.wait(1000);
    cy.get("#logInModal").should("be.visible");
    cy.percySnapshot("Modal de connexion");
    cy.get("#loginusername")
      .should("be.visible")
      .type(username)
      .should("have.value", username);
    cy.get("#loginpassword").type(password);

    cy.get("#logInModal").find(".btn-primary").click();
  });

  it("add product to cart", () => {
    cy.get("#nameofuser")
      .should("be.visible")
      .and("include.text", `Welcome ${username}`);
    cy.get(".card-block").eq(2).find(".card-title").click();
    cy.url().should("include", "prod.html");
    cy.get(".price-container").should("include.text", "$");
    cy.get(".btn-success").click();
    cy.percySnapshot("Page produit");

    cy.on("window:alert", (alertMessage) => {
      expect(alertMessage).to.eq("Product added.");
    });
    cy.get("#cartur").click();
    cy.url().should("include", "cart.html");
    cy.get("#tbodyid")
      .find("tr")
      .should("exist")
      .and("include.text", "Nexus 6");
    cy.percySnapshot("Page panier");
  });

  it("place order", () => {
    cy.intercept({
      method: "POST",
      url: "**/deletecart",
    }).as("purchaseOrder");
    cy.get('[data-target="#orderModal"]').click();
    cy.get("#orderModal").should("be.visible");
    cy.percySnapshot("Modal de paiement");
    cy.get("#name").type(faker.name.findName());
    cy.get("#country").type(faker.address.country());
    cy.get("#city").type(faker.address.cityName());
    cy.get("#card").type(faker.finance.creditCardNumber("visa"));
    cy.get("#month").type("09");
    cy.get("#year").type("2024");
    cy.get("#orderModal").find(".btn-primary").click();
    cy.wait("@purchaseOrder").then((interception) => {
      expect(interception.response.statusCode).eq(200);
      expect(interception.response.body).eq("Item deleted.");
    });
    cy.contains("OK").click();
    //cy.url().should("include", "index.html");
  });
});
