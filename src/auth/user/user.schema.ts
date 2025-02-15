import { ApiProperty } from '@nestjs/swagger';

export class User {
    @ApiProperty()
    nickname: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    age: number;

    @ApiProperty()
    name: string;
  }