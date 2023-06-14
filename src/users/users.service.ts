import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { compareSync, hashSync } from 'bcrypt';
import { isEmail } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.password)
      createUserDto.password = hashSync(
        createUserDto.password,
        process.env.SALT || 12,
      );

    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      console.log(error);
      if (error.code == 11000)
        throw new ConflictException('email or username already taken!');
      throw error;
    }
  }

  async findOneByUsername(username: string) {
    return await this.userModel.findOne({ username }).lean();
  }

  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email }).lean();
  }

  async findAccountMatchUsernameOrEmail(
    usernameOrEmail: string,
    password: string,
  ) {
    let account: (User & { _id: Types.ObjectId }) | null;

    if (isEmail(usernameOrEmail)) {
      account = await this.userModel.findOne({ email: usernameOrEmail });
    } else {
      account = await this.userModel.findOne({ username: usernameOrEmail });
    }
    if (account && compareSync(password, account.password)) return account;
    throw new UnauthorizedException();
  }
}
