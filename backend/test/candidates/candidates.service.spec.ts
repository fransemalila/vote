import { CandidatesService } from '../../src/candidates/candidates.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('CandidatesService', () => {
  let service: CandidatesService;
  let prisma: PrismaService;
  let io: { emit: jest.Mock };

  beforeEach(() => {
    prisma = {
      candidate: {
        create: jest.fn().mockResolvedValue({ id: '1', name: 'Test', party: 'Party', position: 'PRESIDENTIAL', electionId: 'e1' }),
        findMany: jest.fn().mockResolvedValue([{ id: '1', name: 'Test', party: 'Party', position: 'PRESIDENTIAL', electionId: 'e1' }]),
        findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'Test', party: 'Party', position: 'PRESIDENTIAL', electionId: 'e1' }),
        update: jest.fn().mockResolvedValue({ id: '1', name: 'Updated', party: 'Party', position: 'PRESIDENTIAL', electionId: 'e1' }),
        delete: jest.fn().mockResolvedValue({ id: '1', name: 'Test', party: 'Party', position: 'PRESIDENTIAL', electionId: 'e1' }),
      },
    } as any;
    service = new CandidatesService(prisma);
    io = { emit: jest.fn() };
    service.setSocketServer(io as any);
  });

  it('should create a candidate', async () => {
    const result = await service.create({ name: 'Test', party: 'Party', position: 'PRESIDENTIAL', electionId: 'e1' });
    expect(result).toHaveProperty('id');
    expect(io.emit).toHaveBeenCalledWith('candidateUpdate', expect.anything());
  });

  it('should find all candidates', async () => {
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should find one candidate', async () => {
    const result = await service.findOne('1');
    expect(result).toHaveProperty('id', '1');
  });

  it('should update a candidate', async () => {
    const result = await service.update('1', { name: 'Updated' });
    expect(result).toHaveProperty('name', 'Updated');
    expect(io.emit).toHaveBeenCalledWith('candidateUpdate', expect.anything());
  });

  it('should remove a candidate', async () => {
    const result = await service.remove('1');
    expect(result).toHaveProperty('message');
    expect(io.emit).toHaveBeenCalledWith('candidateUpdate', expect.anything());
  });
}); 