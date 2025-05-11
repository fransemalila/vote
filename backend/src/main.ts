import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VotesService } from './votes/votes.service';
import { CandidatesService } from './candidates/candidates.service';
import { Server } from 'socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: '*', // Adjust as needed for production
      credentials: true,
    },
  });

  // Set up Socket.IO
  const server = app.getHttpServer();
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Pass Socket.IO instance to VotesService and CandidatesService
  const votesService = app.get(VotesService);
  votesService.setSocketServer(io);
  const candidatesService = app.get(CandidatesService);
  candidatesService.setSocketServer(io);

  // Emit vote updates on connection (for demonstration)
  io.on('connection', (socket) => {
    socket.on('castVote', (data) => {
      io.emit('voteUpdate', data); // This can be triggered from the VotesService as well
    });
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
