export function successResponse(data, message = "Success", statusCode = 200) {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
}

export function errorResponse(
  message = "Error",
  statusCode = 400,
  errors = null,
) {
  return {
    success: false,
    message,
    errors,
    statusCode,
  };
}

export function validateRequired(data, fields) {
  const errors = {};
  fields.forEach((field) => {
    if (
      !data[field] ||
      (typeof data[field] === "string" && !data[field].trim())
    ) {
      errors[field] = `${field} is required`;
    }
  });
  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateDataTypes(data, schema) {
  const errors = {};
  Object.keys(schema).forEach((field) => {
    const expectedType = schema[field];
    const actualType = typeof data[field];
    if (data[field] !== undefined && actualType !== expectedType) {
      errors[field] = `${field} must be of type ${expectedType}`;
    }
  });
  return Object.keys(errors).length > 0 ? errors : null;
}
