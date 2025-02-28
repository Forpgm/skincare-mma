const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { Brand, Product, Account, Feedback } = require("../models");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description:
        "This is the API documentation for the Node.js and MongoDB project",
    },
    servers: [
      {
        url: "http://localhost:3000", // Base URL for your API
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Indicates the format of the token
        },
      },
      schemas: {
        Category: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Unique identifier for the category",
            },
            name: {
              type: "string",
              description: "The name of the category",
            },
            description: {
              type: "string",
              description: "A description of the category",
            },
            status: {
              type: "boolean",
              description:
                "The status of the category (true: active, false: inactive)",
            },
            createBy: {
              type: "string",
              description: "The ID of the user who created the category",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the category was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the category was last updated",
            },
          },
          required: ["name", "description", "createBy"],
        },
        Skin: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Unique identifier for the skin",
            },
            type: {
              type: "string",
              description: "The type of skin",
            },
            status: {
              type: "boolean",
              description:
                "The status of the skin (true: active, false: inactive)",
            },
            createBy: {
              type: "string",
              description: "The ID of the user who created the skin",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the skin was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the skin was last updated",
            },
          },
          required: ["type", "createBy"],
        },
        Brand: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Unique identifier for the brand",
            },
            name: {
              type: "string",
              description: "The name of the brand",
            },
            contact: {
              type: "string",
              description: "The contact information for the brand",
            },
            status: {
              type: "boolean",
              description:
                "The status of the brand (true: active, false: inactive)",
            },
            createBy: {
              type: "string",
              description: "The ID of the user who created the brand",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the brand was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the brand was last updated",
            },
          },
          required: ["name", "contact", "createBy"],
        },
        Product: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Unique identifier for the product",
            },
            name: {
              type: "string",
              description: "The name of the product",
            },
            description: {
              type: "string",
              description: "A description of the product",
            },
            price: {
              type: "number",
              description: "The price of the product",
            },
            image: {
              type: "string",
              description: "The image URL of the product",
            },
            suitableSkin: {
              type: "string",
              description: "The ID of the skin suitable for the product",
            },
            category: {
              type: "string",
              description: "The ID of the category for the product",
            },
            brand: {
              type: "string",
              description: "The ID of the brand for the product",
            },
            createBy: {
              type: "string",
              description: "The ID of the user who created the product",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the product was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the product was last updated",
            },
          },
          required: [
            "name",
            "description",
            "price",
            "image",
            "suitableSkin",
            "category",
            "brand",
            "createBy",
          ],
        },
        Account: {
          type: "object",
          properties: {
            email: {
              type: "string",
              description: "The email address of the user",
            },
            phone: {
              type: "string",
              description: "The phone number of the user",
            },
            password: {
              type: "string",
              description: "The password of the user",
            },
            googleId: {
              type: "string",
              description: "The Google ID of the user",
            },
            username: {
              type: "string",
              description: "The username of the user",
            },
            role: {
              type: "string",
              description: "The role of the user",
            },
            status: {
              type: "boolean",
              description:
                "The status of the user (true: active, false: inactive)",
            },
          },
          required: ["email", "password", "role"],
        },
        Feedback: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Unique identifier for the feedback",
            },
            fromAccount: {
              type: "string",
              description: "The ID of the user who created the feedback",
            },
            product: {
              type: "string",
              description: "The ID of the product the feedback is about",
            },
            content: {
              type: "string",
              description: "The content of the feedback",
            },
            rating: {
              type: "number",
              description: "The rating of the feedback",
            },
            status: {
              type: "string",
              description:
                "The status of the feedback (true: active, false: inactive)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the feedback was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the feedback was last updated",
            },
          },
          required: ["content", "rating", "createBy"],
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    "./routes/authenticationRoute.js",
    "./routes/categoryRoute.js",
    "./routes/skinRoute.js",
    "./routes/brandRoute.js",
    "./routes/productRoute.js",
    "./routes/dashboardRoute.js",
    "./routes/managerRoute.js",
    "./routes/orderRoute.js",
    "./routes/customerRoute.js",
    "./routes/feedbackRoute.js",
  ],
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
