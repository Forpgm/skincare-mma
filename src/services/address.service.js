const db = require("../models/index");
const { ObjectId } = require("mongodb");
const {
  getProvinceById,
  getDistrictById,
  getWardById,
} = require("../utils/address");
class AddressService {
  async getAddresses(userId) {
    const addresses = await db.Address.find({
      user_id: new ObjectId(String(userId)),
    });

    const result = await Promise.all(
      addresses.map(async (doc) => {
        const address = doc.toObject();

        const provinceName = await getProvinceById(
          Number(address.province_code)
        );
        address.province_name = provinceName.ProvinceName;

        const districtName = await getDistrictById(
          Number(address.province_code),
          Number(address.district_code)
        );
        address.district_name = districtName.DistrictName;

        const wardName = await getWardById(
          Number(address.district_code),
          Number(address.ward_code)
        );
        address.ward_name = wardName.WardName;

        address.full_address = `${address.address}, ${address.ward_name}, ${address.district_name}, ${address.province_name}`;

        return address;
      })
    );

    return result;
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
