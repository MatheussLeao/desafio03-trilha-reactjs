import React from "react";
import { MdDelete, MdAddCircleOutline, MdRemoveCircleOutline } from "react-icons/md";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map((product) => ({
    priceFormated: formatPrice(product.price),
    subTotal: formatPrice(product.price*product.amount)
  }));

  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      const newProduct = {...product};
      sumTotal += newProduct.price * newProduct.amount;
      return sumTotal;
    }, 0),
  );

  function handleProductIncrement(product: Product) {
    const productId = product.id;
    const amount = product.amount + 1;
    updateProductAmount({ productId, amount});
  }

  function handleProductDecrement(product: Product) {
    const productId = product.id;
    const amount = product.amount - 1;
    updateProductAmount({ productId, amount});
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cart &&
            cart.map((item, index) => (
              <tr key={item.title} data-testid="product">
                <td>
                  <img
                    src={item.image}
                    alt={item.title}
                  />
                </td>
                <td>
                  <strong>{item.title}</strong>
                  <span>{cartFormatted[index].priceFormated}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={item.amount <= 1}
                      onClick={() => handleProductDecrement(item)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input type="text" data-testid="product-amount" readOnly value={item.amount} />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(item)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>
                    {
                      cartFormatted[index].subTotal
                    }</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(item.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
