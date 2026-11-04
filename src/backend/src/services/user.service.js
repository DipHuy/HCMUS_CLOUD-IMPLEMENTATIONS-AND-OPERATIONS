const { dbclient } = require("./db.service");
const bcrypt = require("bcryptjs");

const UserService = {
  getAll: () => dbclient.user.findMany(),
  getById: (id) => dbclient.user.findUnique({ where: { id: parseInt(id) } }),
  update: (id, data) =>
    dbclient.user.update({
      where: { id: parseInt(id) },
      data: {
        username: data.username,
        address: data.address,
      },
    }),
  delete: (id) => dbclient.user.delete({ where: { id: parseInt(id) } }),
  register: async (username, password, role = "USER") => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await dbclient.user.create({
      data: { username, password: hashedPassword, role },
    });
  },
  findByUsername: (username) => {
    return dbclient.user.findUnique({ where: { username } });
  },
  updateProfile: async (userId, profileData) => {
    return await dbclient.user.update({
      where: { id: parseInt(userId) },
      data: profileData,
    });
  },
};

module.exports = UserService;
