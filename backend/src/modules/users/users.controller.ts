import {
    Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Logger, Req,
} from '@nestjs/common';
import { CustomRequest } from '../../shared/interfaces/custom-request.interface';
import { UsersService } from './users.service';
import { UserDto, CreateUserDto, UpdateUserDto } from './users.dto';
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { OwnerOrAdminGuard } from '../auth/guards/owner-admin.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './users.types';
import { Roles } from '../auth/guards/auth.decorators';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(
        private readonly usersService: UsersService,
    ) {}

    @Get('currentUser')
    @ApiOkResponse({ type: UserDto })
    async getCurrentUser(@Req() req: CustomRequest): Promise<UserDto> {
        const user = req.user!;
        return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
    }

    @Get(':username')
    @ApiOkResponse({ type: UserDto })
    @UseGuards(OwnerOrAdminGuard)
    async getUser(@Param('username') username: string): Promise<UserDto> {
        const userEntity = await this.usersService.findByUsername(username);
        return plainToInstance(UserDto, userEntity, { excludeExtraneousValues: true });
    }

    @Get()
    @ApiCreatedResponse({ type: UserDto, isArray: true })
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getAllUsers(): Promise<UserDto[]> {
        const users = await this.usersService.findAll();
        return plainToInstance(UserDto, users, { excludeExtraneousValues: true });
    }

    @Post()
    @ApiCreatedResponse({ type: UserDto })
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
        const newUser = await this.usersService.createUser(createUserDto);
        return plainToInstance(UserDto, newUser, { excludeExtraneousValues: true });
    }

    @Put(':username')
    @ApiOkResponse({ type: UserDto })
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateUser(@Param('username') username: string, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
        const updatedUser = await this.usersService.updateUser(username, updateUserDto);
        return plainToInstance(UserDto, updatedUser, { excludeExtraneousValues: true });
    }

    @Delete(':username')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async deleteUser(@Param('username') username: string): Promise<{ message: string }> {
        await this.usersService.deleteUser(username);
        return { message: `User ${username} deleted successfully` };
    }
}
