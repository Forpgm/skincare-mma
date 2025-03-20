const db = require("../models/index");
const { ObjectId } = require("mongodb");
class AddressService {
  async getAddresses(userId) {
    return await db.Address.find({ user_id: new ObjectId(String(userId)) });
  }
  async addAddress(userId, address) {
    return await db.Address.create({
      user_id: userId,
      ...address,
    });
  }
  async deleteAddress(userId, addressId) {
    return await db.Address.deleteOne({
      _id: new ObjectId(String(addressId)),
      user_id: new ObjectId(String(userId)),
    });
  }
  async updateAddress(addressId, payload) {
    return await db.Address.findOneAndUpdate(
      {
        _id: new ObjectId(String(addressId)),
      },
      {
        $set: {
          ...payload,
        },
      },
      { timestamps: true }
    );
  }
  async getDefaultAddress(userId) {
    let addresses = await db.Address.findOne({
      user_id: new ObjectId(String(userId)),
      is_default: true,
    }).sort({ createdAt: -1 });
    if (addresses === null) {
      addresses = await db.Address.findOne({
        user_id: new ObjectId(String(userId)),
      }).sort({ createdAt: -1 });
    }
    return addresses;
  }
}
const addressService = new AddressService();
exports.addressService = addressService;
