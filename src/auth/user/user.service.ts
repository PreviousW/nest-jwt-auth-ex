import { Injectable } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { User } from './user.schema';

@Injectable()
export class UserService {
  private db: Db;

  constructor() {
    MongoClient.connect(process.env.MONGO_URI).then((client) => {
      this.db = client.db("highthon");
    });
  }

  async findByUsername(nickname: string): Promise<User | undefined> {
    return await this.db.collection('users').findOne({ nickname }) as unknown as User;
  }

  async validateUser(nickname: string, password: string) {
    return await this.db.collection('users').findOne({
      nickname,
      password
    }) as unknown as User ?? null
  }

  // false: 존재
  // true: 없음
  async checkAbsent(nickname: string) {
    return await this.db.collection('users').findOne({ nickname }) == undefined
  } 

  async create(user: User) {
    await this.db.collection('users').insertOne(user);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}