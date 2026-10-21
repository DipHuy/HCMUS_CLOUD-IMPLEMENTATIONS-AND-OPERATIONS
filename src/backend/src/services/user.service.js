const { writer, reader } = require("./db.service");
const bcrypt = require("bcryptjs");

const UserService = {
  getAll: () => reader.user.findMany(),
  getById: (id) => reader.user.findUnique({ where: { id: parseInt(id) } }),
  update: (id, data) =>
    writer.user.update({
      where: { id: parseInt(id) },
      data: {
        username: data.username,
        address: data.address,
      },
    }),
  delete: (id) => writer.user.delete({ where: { id: parseInt(id) } }),
  register: async (username, password, role = "USER") => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await writer.user.create({
      data: { username, password: hashedPassword, role },
    });
  },
  findByUsername: (username) => {
    return reader.user.findUnique({ where: { username } });
  },
  updateProfile: async (userId, profileData) => {
    return await writer.user.update({
      where: { id: parseInt(userId) },
      data: profileData,
    });
  },
};

module.exports = UserService;
