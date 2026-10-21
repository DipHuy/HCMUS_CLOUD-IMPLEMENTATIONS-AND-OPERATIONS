const { writer, reader } = require("./db.service");

const serialize = (product) =>
  product && {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    imageUrl: product.imageUrl || "",
  };

const ProductService = {
  getAll: async () => (await reader.product.findMany()).map(serialize),

  getById: async (id) =>
    serialize(await reader.product.findUnique({ where: { id: parseInt(id) } })),

  create: (data) => {
    return writer.product
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
    writer.product
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

  delete: (id) => writer.product.delete({ where: { id: parseInt(id) } }),
};
module.exports = ProductService;
