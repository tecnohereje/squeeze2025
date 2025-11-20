// --- BINS ---
const JSONBIN_API_KEY = '$2a$10$GVC9H798HC/RmxOCkazso.2poPKnfchlFGC5CI1BM/3PJBAu6VwJK'; // Shared Key
const USERS_BIN_URL = 'https://api.jsonbin.io/v3/b/691edcc743b1c97be9b91b85';
const RATINGS_BIN_URL = 'https://api.jsonbin.io/v3/b/691edd3743b1c97be9b91cab';
const BUSINESSES_BIN_URL = 'https://api.jsonbin.io/v3/b/691edd11ae596e708f64d351';

const initialBalance = 100;

// --- Types ---
type UserLedger = {
  [walletAddress: string]: {
    balance: number;
  };
};

type Business = {
  walletAddress: string;
  name: string;
};

type BusinessLedger = {
  [walletAddress: string]: Business;
};

export type Rating = {
  businessId: string;
  rating: number;
  comment: string;
  author: string;
  timestamp: string;
};

export type BusinessProfile = {
  id: string;
  name: string;
  avgRating: number;
  ratings: Rating[];
};

// --- Private Functions ---
async function getBin<T>(binUrl: string): Promise<T> {
  const response = await fetch(binUrl, {
    headers: {
      'X-Master-Key': JSONBIN_API_KEY,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch bin: ${binUrl}`);
  }
  const data = await response.json();
  return data.record;
}

async function updateBin<T>(binUrl: string, data: T): Promise<void> {
  const response = await fetch(binUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update bin: ${binUrl}`);
  }
}

// --- Public Functions ---

// User and Transaction Management
export async function getUserBalance(walletAddress: string): Promise<number> {
  const ledger = await getBin<UserLedger>(USERS_BIN_URL);
  if (!ledger[walletAddress]) {
    ledger[walletAddress] = { balance: initialBalance };
    await updateBin(USERS_BIN_URL, ledger);
    return initialBalance;
  }
  return ledger[walletAddress].balance;
}

export async function executeTransaction(
  fromAddress: string,
  toAddress: string,
  amount: number
): Promise<void> {
  const ledger = await getBin<UserLedger>(USERS_BIN_URL);
  if (!ledger[fromAddress]) {
    ledger[fromAddress] = { balance: initialBalance };
  }
  if (!ledger[toAddress]) {
    ledger[toAddress] = { balance: initialBalance };
  }
  if (ledger[fromAddress].balance < amount) {
    throw new Error('Insufficient funds');
  }
  ledger[fromAddress].balance -= amount;
  ledger[toAddress].balance += amount;
  await updateBin(USERS_BIN_URL, ledger);
}

// Rating and Business Management
export async function submitReview(
  businessId: string,
  rating: number,
  comment: string,
  author: string
): Promise<void> {
  const allRatings = await getBin<Rating[]>(RATINGS_BIN_URL);
  const newRating: Rating = {
    businessId,
    rating,
    comment,
    author,
    timestamp: new Date().toISOString(),
  };
  allRatings.push(newRating);
  await updateBin(RATINGS_BIN_URL, allRatings);
}

export async function registerBusiness(
  walletAddress: string,
  name: string
): Promise<void> {
  const businesses = await getBin<BusinessLedger>(BUSINESSES_BIN_URL);
  if (!businesses[walletAddress]) {
    businesses[walletAddress] = { walletAddress, name };
    await updateBin(BUSINESSES_BIN_URL, businesses);
  }
}

export async function getBusinesses(): Promise<BusinessProfile[]> {
  const businesses = await getBin<BusinessLedger>(BUSINESSES_BIN_URL);
  const allRatings = await getBin<Rating[]>(RATINGS_BIN_URL);

  const profiles: BusinessProfile[] = [];

  for (const walletAddress in businesses) {
    const business = businesses[walletAddress];
    const businessRatings = allRatings.filter(
      (r) => r.businessId === walletAddress
    );
    const avgRating =
      businessRatings.length > 0
        ? businessRatings.reduce((sum, r) => sum + r.rating, 0) /
          businessRatings.length
        : 0;

    profiles.push({
      id: business.walletAddress,
      name: business.name,
      avgRating,
      ratings: businessRatings,
    });
  }

  return profiles;
}
