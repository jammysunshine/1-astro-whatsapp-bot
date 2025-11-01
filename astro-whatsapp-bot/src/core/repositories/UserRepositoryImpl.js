const UserRepository = require('./UserRepository');

/**
 * UserRepositoryImpl
 * Concrete implementation of UserRepository interface
 * Wraps the existing userModel to provide a clean interface
 */
class UserRepositoryImpl extends UserRepository {
  constructor(userModel) {
    super();
    this.userModel = userModel;
  }

  async getUserByPhone(phoneNumber) {
    return await this.userModel.getUserByPhone(phoneNumber);
  }

  async createUser(phoneNumber, profileData = {}) {
    return await this.userModel.createUser(phoneNumber, profileData);
  }

  async updateUserProfile(phoneNumber, updateData) {
    return await this.userModel.updateUserProfile(phoneNumber, updateData);
  }

  async addBirthDetails(phoneNumber, birthDate, birthTime, birthPlace) {
    return await this.userModel.addBirthDetails(phoneNumber, birthDate, birthTime, birthPlace);
  }

  async getAllUsers() {
    return await this.userModel.getAllUsers();
  }

  async deleteUser(phoneNumber) {
    return await this.userModel.deleteUser(phoneNumber);
  }
}

module.exports = UserRepositoryImpl;