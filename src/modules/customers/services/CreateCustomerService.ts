import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('customersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    // TODO
    const emailFound = await this.customersRepository.findByEmail(email);
    if (emailFound) {
      throw new AppError('Email already in use');
    }

    const customer = await this.customersRepository.create({ email, name });
    return customer;
  }
}

export default CreateCustomerService;
