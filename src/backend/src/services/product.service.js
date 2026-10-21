const { writer, reader } = require("./db.service");

const ProductService = {
  getAll: () => reader.product.findMany(),
  getById: (id) => reader.product.findUnique({ where: { id: parseInt(id) } }),
  create: (data) => {
    return writer.product.create({
      data: {
        name: data.name,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        imageUrl: data.image,
      },
    });
  },

  update: (id, data) =>
    writer.product.update({ where: { id: parseInt(id) }, data }),
  delete: (id) => writer.product.delete({ where: { id: parseInt(id) } }),
};
module.exports = ProductService;
