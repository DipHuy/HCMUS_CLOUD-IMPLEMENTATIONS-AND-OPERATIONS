const { dbclient } = require("./db.service");

const serialize = (product) =>
  product && {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    imageUrl: product.imageUrl || "",
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
          imageUrl: data.image ?? data.imageUrl ?? "",
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
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
          imageUrl: data.imageUrl ?? "",
        },
      })
      .then(serialize),

  delete: (id) => dbclient.product.delete({ where: { id: parseInt(id) } }),
};
module.exports = ProductService;
