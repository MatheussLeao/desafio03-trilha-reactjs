import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const newCart = [...cart];
      const hasProduct = newCart.find(product => product.id === productId);

      const { data: stock } = await api.get(`/stock/${[productId]}`);

      const currentAmount = hasProduct ? hasProduct.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (hasProduct) {
        hasProduct.amount = amount;
      } else {
        const { data: product } = await api.get(`/products/${productId}`);

        const newProduct = {
          ...product,
          amount: 1
        }        
        newCart.push(newProduct);
      }
      
      setCart(newCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const hasProduct = cart.find(product => product.id === productId);
      const lisCart = cart.filter(item => item.id !== productId);

      if (!hasProduct) {
        toast.error("Erro na remoção do produto");
        return;
      }

      setCart(lisCart);

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(lisCart));

    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      const upCart = [...cart]
      const searchProduct = upCart.find(item => item.id === productId);
      const { data: stock } = await api.get(`/stock/${productId}`);

      if (amount > stock.amount || !searchProduct) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (amount <= 0) {
        toast.error('A quantidade dever ser maior que 0');
        return;
      }

      searchProduct.amount = amount;

      setCart([
        ...upCart
      ]);

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(upCart));
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
