import { Module, forwardRef } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';
import { OutgoingCommunicationModule } from '../outgoing-communication/outgoing-communication.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    ClientsModule,
    OutgoingCommunicationModule,
    ContentModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
