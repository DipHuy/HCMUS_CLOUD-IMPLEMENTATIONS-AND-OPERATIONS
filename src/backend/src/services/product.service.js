const { dbclient } = require("./db.service");

const serialize = (product) =>
  product && {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    description: product.description || "No description",
    image: product.image || "",
  };

const ProductService = {
  getAll: async () => (await dbclient.product.findMany()).map(serialize),

  getById: async (id) =>
    serialize(
      await dbclient.product.findUnique({ where: { id: parseInt(id) } }),
    ),

  create: (data) => {
    return dbclient.product
      .create({
        data: {
          name: data.name,
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
          description: data.description || "No description",
          image: data.image ?? "",
        },
      })
      .then(serialize);
  },

  update: (id, data) =>
    dbclient.product
      .update({
        where: { id: parseInt(id) },
        data: {
          name: data.name,
          price: parseFloat(data.price) || 0,
          stock: parseInt(data.stock) || 0,
          description: data.description || "No description",
          image: data.image ?? "",
        },
      })
      .then(serialize),

  delete: (id) => dbclient.product.delete({ where: { id: parseInt(id) } }),
};
module.exports = ProductService;
