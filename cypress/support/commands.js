const B2C_ORIGIN = "https://jcmauthdev.b2clogin.com";

/**
 * cy.login() — realiza el flujo completo de autenticación Azure B2C.
 * Usa cy.session() para cachear la sesión entre tests del mismo spec,
 * y cy.origin() para interactuar con el dominio externo de B2C.
 * Las credenciales se leen con Cypress.env() desde config.env.
 */
Cypress.Commands.add("login", () => {
  const user = Cypress.env("cloudassistantUser");
  const password = Cypress.env("cloudassistantPassword");

  cy.session(
    user,
    () => {
      cy.visit("/");

      cy.origin(
        B2C_ORIGIN,
        { args: { user, password } },
        ({ user, password }) => {
          cy.get("#signInName").should("be.visible").type(user);
          cy.get("#password").type(password, { log: false });
          cy.get("#next").click();
        }
      );

      cy.url().should("include", "/dashboard");

      // Cerrar el modal de información de versión si aparece
      cy.get("body").then(($body) => {
        if ($body.find("button").filter(":contains('Cierre')").length) {
          cy.contains("button", "Cierre").click();
        }
      });
    },
    {
      validate() {
        cy.url().should("include", "/dashboard");
      },
    }
  );
});
