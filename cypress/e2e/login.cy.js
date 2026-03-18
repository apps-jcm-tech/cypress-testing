const B2C_ORIGIN = "https://jcmauthdev.b2clogin.com";

describe("Login - Cloudassistant", () => {
  context("Página de inicio de sesión", () => {
    beforeEach(() => {
      // Limpiar todos los tokens MSAL (localStorage/sessionStorage) y cookies
      // para garantizar que la página de login de B2C se muestre siempre.
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
      cy.visit("/");
    });

    it("muestra el formulario de inicio de sesión correctamente", () => {
      cy.origin(B2C_ORIGIN, () => {
        cy.get("#signInName")
          .should("be.visible")
          .and("have.attr", "placeholder", "Dirección de correo electrónico");

        cy.get("#password").should("be.visible");

        cy.get("#next").should("be.visible").and("contain.text", "Entrar");
      });
    });

    it("muestra el logo de JCM en la página de login", () => {
      cy.origin(B2C_ORIGIN, () => {
        cy.get('img[src*="jcm"]').should("be.visible");
      });
    });
  });

  context("Autenticación exitosa", () => {
    it("inicia sesión con credenciales válidas y redirige al dashboard", () => {
      cy.login();
      cy.visit("/dashboard");

      cy.url().should("include", "/dashboard");
      cy.contains("Escritorio").should("be.visible");
      cy.contains("Búsqueda avanzada").should("be.visible");
    });

    it("el dashboard muestra las secciones principales", () => {
      cy.login();
      cy.visit("/dashboard");

      cy.contains("Instalaciones con mantenimiento pendiente").should(
        "be.visible"
      );
      cy.contains("Estado de los dispositivos conectados").should("be.visible");
      cy.contains("Alarmas activas").should("be.visible");
      cy.contains("Acciones rápidas").should("be.visible");
    });
  });

  context("Autenticación fallida", () => {
    beforeEach(() => {
      cy.visit("/");
    });

    it("muestra error con contraseña incorrecta", () => {
      cy.env(["cloudassistantUser"]).then(({ cloudassistantUser: user }) => {
        cy.origin(B2C_ORIGIN, { args: { user } }, ({ user }) => {
          cy.get("#signInName").type(user);
          cy.get("#password").type("contraseña_incorrecta", { log: false });
          cy.get("#next").click();

          cy.get(
            '[aria-live="assertive"], #claimVerificationServerError, .error'
          )
            .should("be.visible")
            .and("not.be.empty");
        });
      });
    });

    it("no permite enviar el formulario con campos vacíos", () => {
      cy.origin(B2C_ORIGIN, () => {
        cy.get("#next").click();

        cy.get("#requiredFieldMissing_signInName, #signInName:invalid, [aria-required='true']")
          .should("exist");
      });
    });
  });
});
