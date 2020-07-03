import { inject, injectable, container } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('ordersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('productsRepository')
    private productsRepository: IProductsRepository,
    @inject('customersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('Customer dont found');
    }
    const productsExists = await this.productsRepository.findAllById(products);
    if (!productsExists.length) {
      throw new AppError('Products dont found');
    }
    const objProduct = products.reduce<any>((acc, cur) => {
      acc[cur.id] = cur.quantity;
      return acc;
    }, {});
    const productsOrders = productsExists.map(p => {
      Object.assign(p, { quantity: p.quantity - objProduct[p.id] });
      return {
        product_id: p.id,
        quantity: Number(objProduct[p.id]),
        price: p.price,
      };
    });
    if (productsExists.some(p => p.quantity < 0)) {
      throw new AppError('Dont have this quantity.');
    }
    await this.productsRepository.updateQuantity(productsExists);
    const order = await this.ordersRepository.create({
      customer,
      products: productsOrders,
    });
    return order;
  }
}

export default CreateOrderService;
