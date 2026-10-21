const { writer, reader } = require("./db.service");

const OrderService = {
  createOrder: async (userId, cartItems) => {
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Use transaction to ensure atomicity
    return await writer.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: userId,
          totalPrice: totalPrice,
          status: "PENDING",
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });
  },

  getUserOrders: (userId) => {
    return reader.order.findMany({
      where: { userId: userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  getAllOrders: () => {
    return reader.order.findMany({
      include: {
        user: { select: { username: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus: (orderId, status) => {
    return writer.order.update({
      where: { id: parseInt(orderId) },
      data: { status: status },
    });
  },
};

module.exports = OrderService;
