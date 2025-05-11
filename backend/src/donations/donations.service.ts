import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { Server } from 'socket.io';

const VALID_CURRENCIES = ['TZS', 'USD'];
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

function isValidPhone(phone: string) {
  // Tanzania phone: +2557XXXXXXXX or +2556XXXXXXXX
  return /^\+255[67][0-9]{8}$/.test(phone);
}

@Injectable()
export class DonationsService {
  private io: Server | null = null;

  constructor(private readonly prisma: PrismaService) {}

  setSocketServer(io: Server) {
    this.io = io;
  }

  async create(userId: string, data: { amount: number; currency: string; phone: string }) {
    if (data.amount <= 0) throw new BadRequestException('Amount must be greater than 0. | Kiasi lazima kiwe zaidi ya sifuri.');
    if (!VALID_CURRENCIES.includes(data.currency)) throw new BadRequestException('Invalid currency. | Sarafu si sahihi.');
    if (!isValidPhone(data.phone)) throw new BadRequestException('Invalid phone number. | Nambari ya simu si sahihi.');
    // Create Stripe PaymentIntent
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Stripe uses cents
        currency: data.currency.toLowerCase(),
        metadata: { userId, phone: data.phone },
      });
    } catch (e) {
      throw new BadRequestException('Payment failed. | Malipo yameshindikana.');
    }
    // Store donation in DB
    const donation = await this.prisma.donation.create({
      data: {
        userId,
        amount: data.amount,
        currency: data.currency,
        paymentRef: paymentIntent.id,
      },
    });
    this.io?.emit('donationReceived', { donation });
    return { donation, clientSecret: paymentIntent.client_secret };
  }

  async findAll() {
    return this.prisma.donation.findMany();
  }

  async findOne(id: string) {
    const donation = await this.prisma.donation.findUnique({ where: { id } });
    if (!donation) throw new NotFoundException('Donation not found. | Mchango haujapatikana.');
    return donation;
  }

  async update(id: string, data: Partial<{ amount: number; currency: string }>) {
    const donation = await this.prisma.donation.findUnique({ where: { id } });
    if (!donation) throw new NotFoundException('Donation not found. | Mchango haujapatikana.');
    return this.prisma.donation.update({ where: { id }, data });
  }

  async remove(id: string) {
    const donation = await this.prisma.donation.findUnique({ where: { id } });
    if (!donation) throw new NotFoundException('Donation not found. | Mchango haujapatikana.');
    await this.prisma.donation.delete({ where: { id } });
    return { message: 'Donation deleted. | Mchango umefutwa.' };
  }
} 