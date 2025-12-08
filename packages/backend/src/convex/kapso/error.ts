/**
 * Custom errors for Kapso operations
 */

export class KapsoError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "KapsoError";
  }
}

export class KapsoCustomerNotFoundError extends KapsoError {
  constructor(userId: string) {
    super(
      `Kapso customer not found for user ${userId}`,
      "KAPSO_CUSTOMER_NOT_FOUND",
      404
    );
    this.name = "KapsoCustomerNotFoundError";
  }
}

export class KapsoSetupLinkCreationError extends KapsoError {
  constructor(message: string) {
    super(
      `Failed to create Kapso setup link: ${message}`,
      "KAPSO_SETUP_LINK_CREATION_ERROR",
      500
    );
    this.name = "KapsoSetupLinkCreationError";
  }
}

export class KapsoCustomerCreationError extends KapsoError {
  constructor(message: string) {
    super(
      `Failed to create Kapso customer: ${message}`,
      "KAPSO_CUSTOMER_CREATION_ERROR",
      500
    );
    this.name = "KapsoCustomerCreationError";
  }
}
