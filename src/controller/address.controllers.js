const { addressService } = require("../services/address.service");

exports.getAddressesController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await addressService.getAddresses(userId);
    res.status(200).json({
      message: "Get addresses successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.addAddressController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;
    const result = await addressService.addAddress(userId, req.body);
    res.status(200).json({
      message: "Add address successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteAddressController = async (req, res, next) => {
  try {
    const { userId } = req.decoded_authorization;

    const result = await addressService.deleteAddress(
      userId,
      req.params.address_id
    );
    res.status(200).json({
      message: "Delete address successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateAddressController = async (req, res, next) => {
  try {
    const { address_id } = req.params;
    const result = await addressService.updateAddress(address_id, req.body);
    res.status(200).json({
      message: "Update address successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};
