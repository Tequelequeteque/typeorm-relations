import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });
    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsResult = await this.ormRepository.find({
      where: { id: In(products.map(p => p.id)) },
    });
    return productsResult;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsId = products.map(product => product.id);
    const objProducts = products.reduce<any>((acc, cur) => {
      acc[cur.id] = cur.quantity;
      return acc;
    }, {});

    const updatedProducts = (
      await this.ormRepository.find({
        where: { id: In(productsId) },
      })
    ).map(product =>
      Object.assign(product, { quantity: objProducts[product.id] }),
    );

    await this.ormRepository.save(updatedProducts);
    return updatedProducts;
  }
}

export default ProductsRepository;
