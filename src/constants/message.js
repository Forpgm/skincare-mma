exports.USERS_MESSAGES = {
  VALIDATION_ERROR: "Validation error",
  // name
  NAME_IS_REQUIRED: "Name is required",
  NAME_MUST_BE_A_STRING: "Name must be a string",
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: "Name length must be from 1 to 100",
  // email
  EMAIL_ALREADY_EXISTS: "Email already exists",
  EMAIL_IS_REQUIRED: "Email is required",
  EMAIL_IS_INVALID: "Email is invalid",
  EMAIL_NOT_EXIST: "Email not exist",
  // password
  PASSWORD_IS_REQUIRED: "Password is required",
  PASSWORD_MUST_BE_A_STRING: "Password must be a string",
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: "Password length must be from 6 to 50",
  // username
  USERNAME_IS_REQUIRED: "Username is required",
  USERNAME_MUST_BE_A_STRING: "Username must be a string",
  USERNAME_LENGTH_MUST_BE_FROM_1_TO_100:
    "Username length must be from 1 to 100",
  // phone
  PHONE_IS_INVALID: "Phone is invalid",
  PHONE_IS_REQUIRED: "Phone is required",
  // registration
  REGISTRATION_SUCCESS: "Registration successful",
  // login
  LOGIN_SUCCESS: "Login successful",
  EMAIL_OR_PASSWORD_IS_INCORRECT: "Email or password is incorrect",
  // access token
  ACCESS_TOKEN_IS_REQUIRED: "Access token is required",
  ACCESS_TOKEN_IS_INVALID: "Access token is invalid",
  // refresh_token
  REFRESH_TOKEN_IS_REQUIRED: "Refresh token is required",
  REFRESH_TOKEN_IS_INVALID: "Refresh token is invalid",
  // forgot password
  CHECK_YOUR_EMAIL_TO_RESET_PASSWORD: "Check your email to reset password",
  // verify forgot password token
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: "Forgot password token is required",
  USER_NOT_EXIST: "User not exist",
  INVALID_FORGOT_PASSWORD_TOKEN: "Invalid forgot password token",
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: "Verify forgot password token success",
  // reset password
  CONFIRM_PASSWORD_IS_REQUIRED: "Confirm password is required",
  CONFIRM_PASSWORD_MUST_BE_A_STRING: "Confirm password must be a string",
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50:
    "Confirm password length must be from 6 to 50",
  RESET_PASSWORD_SUCCESS: "Reset password success",
  // role validator
  USER_IS_NOT_AUTHORIZED: "User is not authorized",
};
exports.CATEGORIES_MESSAGES = {
  GET_ALL_CATEGORIES_SUCCESSFULLY: "Get all categories successfully",
  GET_CATEGORY_DETAIL_SUCCESSFULLY: "Get category detail successfully",
  ADD_CATEGORY_SUCCESSFULLY: "Add category successfully",
  CATEGORY_NOT_FOUND: "Category not found",
  STATUS_MUST_BE_ACTIVE_OR_INACTIVE: "Status must be either active or inactive",
  CATEGORY_NAME_MUST_BE_A_STRING: "Category name must be a string",
  UPDATE_CATEGORY_SUCCESSFULLY: "Update category successfully",
  DELETE_CATEGORY_SUCCESSFULLY: "Delete category successfully",
  GET_SUB_CATEGORY_SUCCESSFULLY: "Get sub category successfully",
};
exports.PRODUCTS_MESSAGES = {
  IMAGES_MUST_BE_URL: "Images must be URL",
  IMAGES_MUST_BE_ARRAY: "Images must be an array",
  IMAGES_MUST_BE_NOT_EMPTY: "Images must be not empty",
  INVALID_PRODUCT_ID: "Invalid product ID",
  GET_ALL_PRODUCTS_SUCCESSFULLY: "Get all products successfully",
  GET_PRODUCT_DETAIL_SUCCESSFULLY: "Get product detail successfully",
  ADD_PRODUCT_SUCCESSFULLY: "Add product successfully",
  PRODUCT_NOT_FOUND: "Product not found",
  PRODUCT_NAME_MUST_BE_A_STRING: "Product name must be a string",
  PRODUCT_DESCRIPTION_MUST_BE_A_STRING: "Product description must be a string",
  PRODUCT_QUANTITY_MUST_BE_A_NUMBER: "Product quantity must be a number",
  PRODUCT_PRICE_MUST_BE_A_NUMBER: "Product price must be a number",
  PRODUCT_SUITABLE_SKIN_MUST_BE_A_STRING:
    "Product suitable skin must be a string",
  PRODUCT_IMAGE_MUST_BE_A_STRING: "Product image must be a string",
  PRODUCT_CATEGORY_MUST_BE_A_STRING: "Product category must be a string",
  PRODUCT_BRAND_MUST_BE_A_STRING: "Product brand must be a string",
  ADD_PRODUCT_SUCCESSFULLY: "Add product successfully",
  UPDATE_PRODUCT_SUCCESSFULLY: "Update product successfully",
  DELETE_PRODUCT_SUCCESSFULLY: "Delete product successfully",
};
exports.WISH_LIST_MESSAGES = {
  ADD_WISH_LIST_SUCCESSFULLY: "Add product to wish list successfully",
  WISH_LIST_NOT_FOUND: "Wish list not found",
  DELETE_WISH_LIST_SUCCESSFULLY: "Delete wish list successfully",
  GET_WISH_LIST_SUCCESSFULLY: "Get wish list successfully",
};
exports.SHIP_MESSAGES = {
  GET_PROVINCES_SUCCESS: "Get provinces success",
  GET_DISTRICTS_SUCCESS: "Get districts success",
  GET_WARDS_SUCCESS: "Get wards success",
  PROVINCE_ID_IS_REQUIRED: "Province id is required",
  PROVINCE_ID_IS_INVALID: "Province id is invalid",
  PROVINCE_ID_MUST_BE_STRING: "Province id must be string",
  DISTRICT_ID_MUST_BE_STRING: "District id must be string",
  DISTRICT_ID_IS_REQUIRED: "District id is required",
  DISTRICT_ID_IS_INVALID: "District id is invalid",
  DISTRICT_ID_IS_NOT_EXIST: "District id is not exist",
  SERVICE_ID_MUST_BE_STRING: "Service id must be string",
  SERVICE_ID_IS_REQUIRED: "Service id is required",
  SERVICE_ID_IS_INVALID: "Service id is invalid",
  WARD_CODE_MUST_BE_STRING: "Ward code must be string",
  WARD_CODE_IS_REQUIRED: "Ward code is required",
  WARD_CODE_IS_INVALID: "Ward code is invalid",
  FROM_DISTRICT_ID_IS_INVALID: "From district id is invalid",
  TO_DISTRICT_ID_IS_INVALID: "To district id is invalid",
  RECEIVER_NAME_MUST_BE_STRING: "Receiver name must be string",
  RECEIVER_NAME_IS_REQUIRED: "Receiver name is required",
  PHONE_NUMBER_MUST_BE_STRING: "Phone number must be string",
  PHONE_NUMBER_IS_REQUIRED: "Phone number is required",
  ADDRESS_MUST_BE_STRING: "Address must be string",
  ADDRESS_IS_REQUIRED: "Address is required",
  VOUCHER_CODE_MUST_BE_STRING: "Voucher code must be string",
  VOUCHER_CODE_IS_INVALID: "Voucher code is invalid",
  VOUCHER_CODE_IS_EXPIRED: "Voucher code is expired",
  VOUCHER_CODE_IS_OUT_OF_STOCK: "Voucher code is out of stock",
};
