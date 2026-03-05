import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listings
export async function createListing(
  agentId: string,
  title: string,
  description: string,
  category: string,
  price: number,
  unit: string
) {
  return (prisma as any).service_listings.create({ data: { 
      agentId,
      title,
      description,
      category,
      price,
      unit,
      status: 'active',
    },
  });
}

export async function getListings(filter?: { category?: string; agentId?: string; status?: string }) {
  const where: any = {};
  if (filter?.category) where.category = filter.category;
  if (filter?.agentId) where.agentId = filter.agentId;
  if (filter?.status) where.status = filter.status;
  else where.status = 'active'; // default to active

  return (prisma as any).service_listings.findMany({
    where,
    include: { agent: {
        include: { owner: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function getListing(id: string) {
  return (prisma as any).service_listings.findUnique({
    where: { id },
    include: { agent: { include: { owner: { select: { id: true, name: true } } } },
      orders: {
        where: { status: { not: 'cancelled' } },
        orderBy: { created_at: 'desc' },
        take: 5,
      },
    },
  });
}

export async function updateListing(id: string, agentId: string, data: any) {
  // Ensure agent owns this listing
  const listing = await (prisma as any).service_listings.findFirst({
    where: { id, agentId },
  });
  if (!listing) throw new Error('Listing not found or not owned by you');

  return (prisma as any).service_listings.update({
    where: { id },
    data,
  });
}

export async function deleteListing(id: string, agentId: string) {
  const listing = await (prisma as any).service_listings.findFirst({
    where: { id, agentId },
  });
  if (!listing) throw new Error('Listing not found or not owned by you');

  return (prisma as any).service_listings.update({
    where: { id },
    data: { status: 'deleted' },
  });
}

// Orders
export async function createOrder(
  listing_id: string,
  buyer_id: string,
  description?: string,
  negotiatedPrice?: number
) {
  const listing = await (prisma as any).service_listings.findUnique({
    where: { id: listing_id },
    include: { agents: true },
  });
  if (!listing) throw new Error('Listing not found');
  if (listing.status !== 'active') throw new Error('Listing is not active');

  const price = negotiatedPrice ?? listing.price;

  return (prisma as any).service_orders.create({ data: { 
      listing_id,
      buyer_id,
      agentId: listing.agentId,
      price,
      description,
      status: 'pending',
    },
  });
}

export async function getOrdersForUser(userId: string, role: 'buyer' | 'agent' | 'all' = 'all') {
  const where: any = {};
  if (role === 'buyer') where.buyer_id = userId;
  else if (role === 'agent') where.agent = { owner_id: userId }; // agent's owner
  else where.OR = [{ buyer_id: userId }, { agent: { owner_id: userId } }];

  return (prisma as any).service_orders.findMany({
    where,
    include: { listing: true,
      buyer: { select: { id: true, name: true } },
      agent: { include: { owner: { select: { id: true, name: true } } } },
      executions: { orderBy: { timestamp: 'desc' } },
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function acceptOrder(order_id: string, agentowner_id: string) {
  // Verify that the agent belongs to this owner
  const order = await (prisma as any).service_orders.findUnique({
    where: { id: order_id },
    include: { agents: true },
  });
  if (!order) throw new Error('Order not found');
  if (order.agent.owner_id !== agentowner_id) throw new Error('Not authorized');
  if (order.status !== 'pending') throw new Error('Order cannot be accepted');

  return (prisma as any).service_orders.update({
    where: { id: order_id },
    data: { status: 'in_progress', started_at: new Date() },
  });
}

export async function completeOrder(order_id: string, agentowner_id: string) {
  const order = await (prisma as any).service_orders.findUnique({
    where: { id: order_id },
    include: { agents: true },
  });
  if (!order) throw new Error('Order not found');
  if (order.agent.owner_id !== agentowner_id) throw new Error('Not authorized');
  if (order.status !== 'in_progress') throw new Error('Order not in progress');

  // Transfer tokens from buyer to agent owner
  const buyer = await (prisma as any).users.findUnique({ where: { id: order.buyer_id } });
  if (!buyer) throw new Error('Buyer not found');
  if (buyer.token_balance < order.price) throw new Error('Buyer has insufficient funds');

  // Use a transaction to ensure atomicity
  const [updatedOrder] = await prisma.$transaction([
// @ts-ignore
    (prisma as any).service_orders.update({
      where: { id: order_id },
      data: { status: 'completed', completed_at: new Date() },
    }),
// @ts-ignore
    (prisma as any).users.update({
      where: { id: order.buyer_id },
      data: { token_balance: { decrement: order.price } },
    }),
// @ts-ignore
    (prisma as any).users.update({
      where: { id: order.agent.owner_id },
      data: { token_balance: { increment: order.price } },
    }),
// @ts-ignore
    (prisma as any).token_transactions.create({ data: { 
        from_user_id: order.buyer_id,
        to_user_id: order.agent.owner_id,
        amount: order.price,
        type: 'marketplace_payment',
        
      },
    }),
  ]);

  return updatedOrder;
}

export async function addExecutionLog(order_id: string, agentowner_id: string, message: string, result?: any) {
  const order = await (prisma as any).service_orders.findUnique({
    where: { id: order_id },
    include: { agents: true },
  });
  if (!order) throw new Error('Order not found');
  if (order.agent.owner_id !== agentowner_id) throw new Error('Not authorized');

  return (prisma as any).service_execution_logs.create({ data: { 
      order_id,
      message,
      result: result || {},
    },
  });
}










export async function getListings(filters?: any) {
  return (prisma as any).service_listings.findMany({ where: filters });
}
export async function getListing(id: string) {
  return (prisma as any).service_listings.findUnique({ where: { id } });
}
export async function createListing(agentId: string, title: string, description: string, category: string, price: number, unit: string) {
  return (prisma as any).service_listings.create({ data: { agentId, title, description, serviceType: category, price, currency: unit, pricingType: 'fixed' } });
}
export async function createOrder(listing_id: string, buyer_id: string, description: string, price: number) {
  return (prisma as any).service_orders.create({ data: { listing_id, buyer_id, description, totalAmount: price, status: 'pending' } });
}
export async function getOrdersForUser(userId: string, role: string) {
  return (prisma as any).service_orders.findMany({ where: { buyer_id: userId } });
}















