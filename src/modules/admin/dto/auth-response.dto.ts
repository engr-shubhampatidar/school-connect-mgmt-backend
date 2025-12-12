import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class AuthResponseDto {
  @ApiProperty({ description: 'Short-lived access token' })
  accessToken: string;

  @ApiProperty({ description: 'Long-lived refresh token' })
  refreshToken: string;

  @ApiProperty({ type: () => UserDto })
  user: UserDto;
}
